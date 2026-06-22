import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Palette, LayoutList, LayoutTemplate } from "lucide-react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import TabPanel from "../../../components/cv-builder/sidebar/TabPanel";
import SimpleTemplate from "../../../components/cv-builder/templates/SimpleTemplate";
import DraggableItem from "../../../components/cv-builder/sidebar/DraggableItem";

const TEMPLATE_COMPONENTS = { simple: SimpleTemplate };

const CVBuilderPage = () => {
  const { id: cvId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("layout");
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // State lưu ID của item đang được nhấc lên
  const [activeDragId, setActiveDragId] = useState(null);

  const [cvData, setCvData] = useState({
    settings: { template: "simple", font: "Roboto", primaryColor: "#00b14f", accentColor: "#e8f7ee" },
    layout: {
      activeRows: [
        { id: "row-1", ratio: "10-0", leftItems: ["avatar", "personalInfo", "contactInfo", "objective"], rightItems: [] },
        { id: "row-2", ratio: "50-50", leftItems: ["experience", "education"], rightItems: ["skills", "hobbies"] },
      ],
      unusedItems: ["activities", "awards", "certifications", "projects", "references", "customSection"],
    },
    data: {
      avatar: { url: "" }, personalInfo: { fullName: "", jobTitle: "" }, contactInfo: { phone: "", email: "", website: "", address: "", dateOfBirth: "", gender: "" },
      objective: "", experience: [], education: [], activities: [], skills: [], hobbies: [], awards: [], certifications: [], projects: [], references: [],
    },
  });

  const updateLayout = (newLayout) => setCvData((prev) => ({ ...prev, layout: newLayout }));

  // ===============================================
  // XỬ LÝ LOGIC KÉO THẢ
  // ===============================================
  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const getRawId = (str) => str.replace("item-", "").replace("unused-", "");
    const rawActiveId = getRawId(activeId);
    const rawOverId = getRawId(overId);

    let newLayout = JSON.parse(JSON.stringify(cvData.layout));

    let source = { type: null, list: null, index: -1, rowId: null, col: null };
    if (activeId.startsWith("unused-")) {
      source = { type: "unused", list: newLayout.unusedItems, index: newLayout.unusedItems.indexOf(rawActiveId) };
    } else {
      newLayout.activeRows.forEach(row => {
        if (row.leftItems.includes(rawActiveId)) source = { type: "active", list: row.leftItems, index: row.leftItems.indexOf(rawActiveId), rowId: row.id, col: "left" };
        if (row.rightItems.includes(rawActiveId)) source = { type: "active", list: row.rightItems, index: row.rightItems.indexOf(rawActiveId), rowId: row.id, col: "right" };
      });
    }

    let dest = { type: null, list: null, index: -1, rowId: null, col: null };
    if (overId.startsWith("unused-") || overId === "unused-pool") {
      dest = { type: "unused", list: newLayout.unusedItems, index: overId === "unused-pool" ? newLayout.unusedItems.length : newLayout.unusedItems.indexOf(rawOverId) };
    } else if (overId.startsWith("droppable-")) {
      const parts = overId.split("-");
      const rId = `row-${parts[2]}`; const cId = parts[3];
      const row = newLayout.activeRows.find(r => r.id === rId);
      dest = { type: "active", list: cId === "left" ? row.leftItems : row.rightItems, index: -1, rowId: rId, col: cId };
    } else {
      newLayout.activeRows.forEach(row => {
        if (row.leftItems.includes(rawOverId)) dest = { type: "active", list: row.leftItems, index: row.leftItems.indexOf(rawOverId), rowId: row.id, col: "left" };
        if (row.rightItems.includes(rawOverId)) dest = { type: "active", list: row.rightItems, index: row.rightItems.indexOf(rawOverId), rowId: row.id, col: "right" };
      });
    }

    if (!source.type || !dest.type) return;

    if (source.list === dest.list) {
      const updatedList = arrayMove(source.list, source.index, dest.index !== -1 ? dest.index : dest.list.length - 1);
      if (source.type === "unused") newLayout.unusedItems = updatedList;
      else {
        const row = newLayout.activeRows.find(r => r.id === source.rowId);
        if (source.col === "left") row.leftItems = updatedList; else row.rightItems = updatedList;
      }
      return updateLayout(newLayout);
    }

    if (source.type === "unused" && rawActiveId === "customSection" && dest.type === "active") {
      const newCustomId = `customSection_${Date.now()}`;
      if (dest.index === -1) dest.list.push(newCustomId);
      else dest.list.splice(dest.index, 0, newCustomId);

      return setCvData(prev => ({
        ...prev, layout: newLayout, data: { ...prev.data, [newCustomId]: { title: "Thông tin thêm", content: "" } }
      }));
    }

    const itemToMove = rawActiveId;
    source.list.splice(source.index, 1);

    if (dest.type === "unused" && itemToMove.startsWith("customSection_")) {
      return setCvData(prev => {
        const newData = { ...prev.data }; delete newData[itemToMove];
        return { ...prev, layout: newLayout, data: newData };
      });
    }

    if (dest.index === -1) dest.list.push(itemToMove);
    else dest.list.splice(dest.index, 0, itemToMove);

    updateLayout(newLayout);
  };

  // ===============================================
  // XỬ LÝ GỘP / TÁCH CỘT THÔNG MINH
  // ===============================================
  const handleChangeRatio = (rowId, newRatio) => {
    let newLayout = JSON.parse(JSON.stringify(cvData.layout));
    newLayout.activeRows = newLayout.activeRows.map(row => {
      if (row.id === rowId) {
        const oldIsOneCol = row.ratio === '10-0' || row.ratio === '100-0';
        const newIsOneCol = newRatio === '10-0' || newRatio === '100-0';

        let newLeft = [...row.leftItems];
        let newRight = [...row.rightItems];

        // 2 Cột -> 1 Cột: Trút hết nội dung cột phải sang dưới đáy cột trái
        if (!oldIsOneCol && newIsOneCol) {
          newLeft = [...newLeft, ...newRight];
          newRight = [];
        } 
        // 1 Cột -> 2 Cột: Cắt đôi mảng ở cột trái ra chia đều cho 2 bên
        else if (oldIsOneCol && !newIsOneCol) {
          const mid = Math.ceil(newLeft.length / 2);
          newRight = newLeft.splice(mid); 
        }

        return { ...row, ratio: newRatio, leftItems: newLeft, rightItems: newRight };
      }
      return row;
    });
    updateLayout(newLayout);
  };

  const handleFontChange = (font) => setCvData(prev => ({ ...prev, settings: { ...prev.settings, font } }));
  const handleColorChange = (primaryColor, accentColor) => setCvData(prev => ({ ...prev, settings: { ...prev.settings, primaryColor, accentColor } }));
  
  const handleSaveCv = () => alert("Dữ liệu đã sẵn sàng gửi xuống DB!");

  const SelectedTemplate = TEMPLATE_COMPONENTS[cvData.settings.template] || SimpleTemplate;

  // Render "Bóng ma" lơ lửng khi kéo thả
// Render "Bóng ma" lơ lửng khi kéo thả
  const renderDragOverlay = () => {
    if (!activeDragId) return null;
    const rawId = activeDragId.replace("item-", "").replace("unused-", "");
    
    return (
      <DraggableItem 
        id="overlay" 
        itemId={rawId} 
        primaryColor={cvData.settings.primaryColor} 
        isOverlay={true} 
      />
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#f3f4f6]">
      <header className="h-14 bg-white border-b flex items-center justify-between p-4 shadow-sm z-20 font-bold text-gray-700">
        <span>Worklify CV Builder</span>
        <button onClick={handleSaveCv} className="bg-[#00b14f] text-white px-4 py-1.5 rounded text-sm hover:bg-green-600">Lưu CV</button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="w-[150px] bg-white border-r z-20 shadow-sm flex flex-col items-center py-4 gap-4">
          <button onClick={() => { setActiveTab("design"); setIsPanelOpen(true); }} className={`p-3 rounded-lg flex flex-col items-center transition-all ${activeTab === "design" && isPanelOpen ? "bg-[#e8f7ee] text-[#00b14f]" : "text-gray-500 hover:bg-gray-100"}`} > <Palette size={20} /> <span className="text-[10px] mt-1 font-medium text-center">Thiết kế</span> </button>
          <button onClick={() => { setActiveTab("layout"); setIsPanelOpen(true); }} className={`p-3 rounded-lg flex flex-col items-center transition-all ${activeTab === "layout" && isPanelOpen ? "bg-[#e8f7ee] text-[#00b14f]" : "text-gray-500 hover:bg-gray-100"}`} > <LayoutList size={20} /> <span className="text-[10px] mt-1 font-medium">Bố cục</span> </button>
          <button onClick={() => { setActiveTab("template"); setIsPanelOpen(true); }} className={`p-3 rounded-lg flex flex-col items-center transition-all ${activeTab === "template" && isPanelOpen ? "bg-[#e8f7ee] text-[#00b14f]" : "text-gray-500 hover:bg-gray-100"}`} > <LayoutTemplate size={20} /> <span className="text-[10px] mt-1 font-medium text-center">Mẫu CV</span> </button>
        </div>

        {/* THÊM onDragStart VÀ DragOverlay */}
        <DndContext 
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          <TabPanel activeTab={activeTab} isPanelOpen={isPanelOpen} setIsPanelOpen={setIsPanelOpen} cvData={cvData} setCvData={setCvData} handleFontChange={handleFontChange} handleColorChange={handleColorChange} handleDragEnd={handleDragEnd} handleChangeRatio={handleChangeRatio} />
          
          {/* Lớp phủ chứa item đang bay */}
          <DragOverlay>
            {renderDragOverlay()}
          </DragOverlay>
        </DndContext>

        <div className="flex-1 overflow-y-auto bg-gray-200 relative flex justify-center py-10 transition-all" style={{ marginLeft: isPanelOpen ? "10px" : "0" }}>
          <div className="w-[794px] min-h-[1123px] shadow-xl bg-white">
            <SelectedTemplate cvData={cvData} onSectionClick={(id) => console.log('Edit', id)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVBuilderPage;