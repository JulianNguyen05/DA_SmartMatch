import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Palette, LayoutList, LayoutTemplate, Loader } from "lucide-react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import domtoimage from 'dom-to-image-more';

import TabPanel from "../../../components/cv-builder/sidebar/TabPanel";
import DraggableItem from "../../../components/cv-builder/sidebar/DraggableItem";
import authService from "../../../features/auth/authService";
import candidateService from "../../../features/candidate/candidateService";

import SimpleTemplate, { SIMPLE_TEMPLATE_CONFIG } from "../../../components/cv-builder/templates/SimpleTemplate";
// import HarvardTemplate, { HARVARD_TEMPLATE_CONFIG } from "../../../components/cv-builder/templates/HarvardTemplate";
// import ProfessionalTemplate, { PROFESSIONAL_TEMPLATE_CONFIG } from "../../../components/cv-builder/templates/ProfessionalTemplate";

const TEMPLATE_REGISTRY = {
  simple: { component: SimpleTemplate, config: SIMPLE_TEMPLATE_CONFIG },
  // harvard: { component: HarvardTemplate, config: HARVARD_TEMPLATE_CONFIG },
  // professional: { component: ProfessionalTemplate, config: PROFESSIONAL_TEMPLATE_CONFIG },
};

const CVBuilderPage = () => {
  const { id: cvId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("layout");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activeDragId, setActiveDragId] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  
  const [uiState, setUiState] = useState({ isLoading: false, isSaving: false });
  const [totalPages, setTotalPages] = useState(1);
  const paperRef = useRef(null);

  const defaultTemplateConfig = TEMPLATE_REGISTRY.simple.config;
  
  const [cvData, setCvData] = useState({
    settings: defaultTemplateConfig.defaultSettings,
    layout: defaultTemplateConfig.defaultLayout,
    data: defaultTemplateConfig.defaultData,
  });

  useEffect(() => {
    if (!paperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.contentRect.height;
        const pages = Math.max(1, Math.ceil((height - 5) / 1123));
        setTotalPages(pages);
      }
    });
    observer.observe(paperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchCvData = async () => {
      if (!cvId) return;
      const currentUser = authService.getCurrentUser();
      if (!currentUser?.userId) return;

      setUiState(prev => ({ ...prev, isLoading: true }));
      try {
        const response = await candidateService.getCvDetail(currentUser.userId, cvId);
        const fetchedCv = response.data;
        
        if (fetchedCv && fetchedCv.rawText) {
          const parsedData = JSON.parse(fetchedCv.rawText);
          const templateName = parsedData.settings?.template || 'simple';
          const tplConfig = TEMPLATE_REGISTRY[templateName]?.config || TEMPLATE_REGISTRY.simple.config;

          setCvData({
            settings: { ...tplConfig.defaultSettings, ...(parsedData.settings || {}) },
            layout: parsedData.layout || tplConfig.defaultLayout,
            data: { ...tplConfig.defaultData, ...(parsedData.data || parsedData) },
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải CV:", error);
        alert("Không thể tải thông tin CV này.");
      } finally {
        setUiState(prev => ({ ...prev, isLoading: false }));
      }
    };
    fetchCvData();
  }, [cvId]); 

  const handleSaveCv = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser?.userId) {
      alert("Vui lòng đăng nhập để lưu CV.");
      return;
    }

    setUiState(prev => ({ ...prev, isSaving: true }));
    try {
      const payload = {
        title: "CV_Tu_Tao",
        rawText: JSON.stringify(cvData)
      };

      let savedCvId = cvId;
      if (cvId) {
        await candidateService.updateCv(currentUser.userId, cvId, payload);
      } else {
        const res = await candidateService.createCv(currentUser.userId, payload);
        savedCvId = res.data.id;
      }

      try {
        const element = paperRef.current;
        const blob = await domtoimage.toBlob(element, {
          quality: 0.85,
          bgcolor: '#ffffff',
          width: element.offsetWidth,
          height: element.offsetHeight,
        });

        const thumbnailFile = new File([blob], `cv_thumbnail_${savedCvId}.jpg`, { type: 'image/jpeg' });
        await candidateService.uploadCvThumbnail(currentUser.userId, savedCvId, thumbnailFile);
        alert("Lưu CV và tạo ảnh thu nhỏ thành công!");

      } catch (imageError) {
        console.error("Lỗi khi chụp ảnh CV:", imageError);
        alert("Đã lưu dữ liệu CV, nhưng không tạo được ảnh thu nhỏ.");
      }

      if (!cvId) {
        navigate(`/candidate/cv-builder/${savedCvId}`, { replace: true });
      }

    } catch (error) {
      console.error("Lỗi khi kết nối với máy chủ:", error);
      alert("Đã xảy ra lỗi khi lưu CV. Vui lòng thử lại!");
    } finally {
      setUiState(prev => ({ ...prev, isSaving: false }));
    }
  };

  const updateLayout = (newLayout) => setCvData((prev) => ({ ...prev, layout: newLayout }));

  const handleSettingChange = (key, value) => {
    setCvData((prev) => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
  };

  const handleTemplateChange = (templateName) => {
    const entry = TEMPLATE_REGISTRY[templateName];
    if (!entry) return;

    setCvData((prev) => ({
      settings: { ...entry.config.defaultSettings, ...prev.settings, template: templateName },
      layout: entry.config.defaultLayout,
      data: prev.data,
    }));
  };

  const getSectionSortIndex = (id) => {
    const currentTemplate = cvData.settings.template;
    const orderArray = TEMPLATE_REGISTRY[currentTemplate]?.config.sectionOrder || TEMPLATE_REGISTRY.simple.config.sectionOrder;
    const idx = orderArray.indexOf(id);
    return idx === -1 ? 99 : idx;
  };

  const handleAddRow = () => {
    let newLayout = JSON.parse(JSON.stringify(cvData.layout));
    newLayout.activeRows.push({ id: `row-${Date.now()}`, ratio: "10-0", leftItems: [], rightItems: [] });
    updateLayout(newLayout);
  };

  const handleDeleteRow = (rowId) => {
    let newLayout = JSON.parse(JSON.stringify(cvData.layout));
    const rowToDelete = newLayout.activeRows.find((r) => r.id === rowId);
    if (!rowToDelete) return;
    const itemsToRecover = [...rowToDelete.leftItems, ...rowToDelete.rightItems];
    newLayout.unusedItems = [...newLayout.unusedItems, ...itemsToRecover];
    newLayout.unusedItems.sort((a, b) => getSectionSortIndex(a) - getSectionSortIndex(b));
    newLayout.activeRows = newLayout.activeRows.filter((r) => r.id !== rowId);
    updateLayout(newLayout);
  };

  const handleMoveRow = (index, direction) => {
    let newLayout = JSON.parse(JSON.stringify(cvData.layout));
    const rows = newLayout.activeRows;
    if (direction === "up" && index > 0) [rows[index - 1], rows[index]] = [rows[index], rows[index - 1]];
    else if (direction === "down" && index < rows.length - 1) [rows[index + 1], rows[index]] = [rows[index], rows[index + 1]];
    updateLayout(newLayout);
  };

  const handleFontChange = (font) => handleSettingChange("font", font);

  const handleColorChange = (primaryColor, accentColor) => {
    handleSettingChange("primaryColor", primaryColor);
    handleSettingChange("accentColor", accentColor);
  };

  const handleUpdateSectionData = (sectionId, updatedData) =>
    setCvData((prevCvData) => ({
      ...prevCvData,
      data: { ...prevCvData.data, [sectionId]: updatedData }
    }));

  const handleDragStart = (event) => setActiveDragId(event.active.id);

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
    if (activeId.startsWith("unused-")) source = { type: "unused", list: newLayout.unusedItems, index: newLayout.unusedItems.indexOf(rawActiveId) };
    else newLayout.activeRows.forEach((row) => {
      if (row.leftItems.includes(rawActiveId)) source = { type: "active", list: row.leftItems, index: row.leftItems.indexOf(rawActiveId), rowId: row.id, col: "left" };
      if (row.rightItems.includes(rawActiveId)) source = { type: "active", list: row.rightItems, index: row.rightItems.indexOf(rawActiveId), rowId: row.id, col: "right" };
    });

    let dest = { type: null, list: null, index: -1, rowId: null, col: null };
    if (overId.startsWith("unused-") || overId === "unused-pool") dest = { type: "unused", list: newLayout.unusedItems, index: overId === "unused-pool" ? newLayout.unusedItems.length : newLayout.unusedItems.indexOf(rawOverId) };
    else if (overId.startsWith("droppable-")) {
      const parts = overId.split("-"); const rId = `row-${parts[2]}`; const cId = parts[3];
      const row = newLayout.activeRows.find((r) => r.id === rId);
      dest = { type: "active", list: cId === "left" ? row.leftItems : row.rightItems, index: -1, rowId: rId, col: cId };
    } else newLayout.activeRows.forEach((row) => {
      if (row.leftItems.includes(rawOverId)) dest = { type: "active", list: row.leftItems, index: row.leftItems.indexOf(rawOverId), rowId: row.id, col: "left" };
      if (row.rightItems.includes(rawOverId)) dest = { type: "active", list: row.rightItems, index: row.rightItems.indexOf(rawOverId), rowId: row.id, col: "right" };
    });

    if (!source.type || !dest.type) return;

    if (source.list === dest.list) {
      const updatedList = arrayMove(source.list, source.index, dest.index !== -1 ? dest.index : dest.list.length - 1);
      if (source.type === "unused") newLayout.unusedItems = updatedList;
      else {
        const row = newLayout.activeRows.find((r) => r.id === source.rowId);
        if (source.col === "left") row.leftItems = updatedList; else row.rightItems = updatedList;
      }
      return updateLayout(newLayout);
    }

    if (source.type === "unused" && rawActiveId === "customSection" && dest.type === "active") {
      const newCustomId = `customSection_${Date.now()}`;
      if (dest.index === -1) dest.list.push(newCustomId); else dest.list.splice(dest.index, 0, newCustomId);
      return setCvData((prev) => ({ ...prev, layout: newLayout, data: { ...prev.data, [newCustomId]: { title: "Thông tin thêm", content: "" } } }));
    }

    const itemToMove = rawActiveId;
    source.list.splice(source.index, 1);

    if (dest.type === "unused" && itemToMove.startsWith("customSection_")) {
      return setCvData((prev) => { const newData = { ...prev.data }; delete newData[itemToMove]; return { ...prev, layout: newLayout, data: newData }; });
    }

    if (dest.index === -1) dest.list.push(itemToMove); else dest.list.splice(dest.index, 0, itemToMove);

    newLayout.unusedItems.sort((a, b) => getSectionSortIndex(a) - getSectionSortIndex(b));
    updateLayout(newLayout);
  };

  const handleChangeRatio = (rowId, newRatio) => {
    let newLayout = JSON.parse(JSON.stringify(cvData.layout));
    newLayout.activeRows = newLayout.activeRows.map((row) => {
      if (row.id === rowId) {
        const oldIsOneCol = row.ratio === "10-0" || row.ratio === "100-0";
        const newIsOneCol = newRatio === "10-0" || newRatio === "100-0";
        let newLeft = [...row.leftItems]; let newRight = [...row.rightItems];

        if (!oldIsOneCol && newIsOneCol) { newLeft = [...newLeft, ...newRight]; newRight = []; }
        else if (oldIsOneCol && !newIsOneCol) { const mid = Math.ceil(newLeft.length / 2); newRight = newLeft.splice(mid); }
        return { ...row, ratio: newRatio, leftItems: newLeft, rightItems: newRight };
      }
      return row;
    });
    updateLayout(newLayout);
  };

  const SelectedTemplate = TEMPLATE_REGISTRY[cvData.settings.template]?.component ?? SimpleTemplate;

  const renderDragOverlay = () => {
    if (!activeDragId) return null;
    const rawId = activeDragId.replace("item-", "").replace("unused-", "");
    return <DraggableItem id="overlay" itemId={rawId} primaryColor={cvData.settings.primaryColor} isOverlay={true} />;
  };

  if (uiState.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center space-x-2 bg-[#f3f4f6]">
        <Loader className="w-8 h-8 text-[#00b14f] animate-spin" />
        <span className="text-gray-600 font-medium">Đang tải CV của bạn...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f3f4f6]">
      <header className="h-14 bg-white border-b flex items-center justify-between p-4 shadow-sm z-20 font-bold text-gray-700">
        <span>Worklify CV Builder</span>
        <button 
          onClick={handleSaveCv} 
          disabled={uiState.isSaving}
          className="bg-[#00b14f] text-white px-4 py-1.5 rounded text-sm hover:bg-green-600 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {uiState.isSaving ? <Loader className="w-4 h-4 animate-spin" /> : null}
          {uiState.isSaving ? "Đang lưu..." : "Lưu CV"}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="w-[150px] bg-white border-r z-20 shadow-sm flex flex-col items-center py-4 gap-4">
          <button onClick={() => { setActiveTab("design"); setIsPanelOpen(true); }} className={`p-3 rounded-lg flex flex-col items-center transition-all ${activeTab === "design" && isPanelOpen ? "bg-[#e8f7ee] text-[#00b14f]" : "text-gray-500 hover:bg-gray-100"}`}> <Palette size={20} /> <span className="text-[10px] mt-1 font-medium text-center"> Thiết kế </span> </button>
          <button onClick={() => { setActiveTab("layout"); setIsPanelOpen(true); }} className={`p-3 rounded-lg flex flex-col items-center transition-all ${activeTab === "layout" && isPanelOpen ? "bg-[#e8f7ee] text-[#00b14f]" : "text-gray-500 hover:bg-gray-100"}`}> <LayoutList size={20} /> <span className="text-[10px] mt-1 font-medium">Bố cục</span> </button>
          <button onClick={() => { setActiveTab("template"); setIsPanelOpen(true); }} className={`p-3 rounded-lg flex flex-col items-center transition-all ${activeTab === "template" && isPanelOpen ? "bg-[#e8f7ee] text-[#00b14f]" : "text-gray-500 hover:bg-gray-100"}`}> <LayoutTemplate size={20} /> <span className="text-[10px] mt-1 font-medium text-center"> Mẫu CV </span> </button>
        </div>

        <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <TabPanel 
            activeTab={activeTab} isPanelOpen={isPanelOpen} setIsPanelOpen={setIsPanelOpen} 
            cvData={cvData} setCvData={setCvData}
            handleFontChange={handleFontChange}
            handleColorChange={handleColorChange}
            handleTemplateChange={handleTemplateChange}
            handleDragEnd={handleDragEnd} handleChangeRatio={handleChangeRatio}
            handleAddRow={handleAddRow} handleDeleteRow={handleDeleteRow} handleMoveRow={handleMoveRow}
            handleSettingChange={handleSettingChange}
            selectedSection={selectedSection}
          />
          <DragOverlay>{renderDragOverlay()}</DragOverlay>
        </DndContext>

        <div className="flex-1 overflow-y-auto bg-gray-300 relative flex justify-center py-10 transition-all" style={{ marginLeft: isPanelOpen ? "10px" : "0" }}>
          <div 
            ref={paperRef} className="w-[794px] min-h-[1123px] h-fit bg-white shadow-xl relative"
            style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 1122px, #00b14f 1122px, #00b14f 1124px)', backgroundSize: '100% 1123px' }}
          >
            {totalPages > 1 && Array.from({ length: totalPages - 1 }).map((_, i) => {
              const pageIndex = i + 1;
              return (
                <div key={pageIndex} className="absolute left-[-55px] bg-[#00b14f] text-white text-[10px] px-2 py-1 rounded shadow-sm z-50 font-medium" style={{ top: `${pageIndex * 1123}px`, transform: 'translateY(-50%)' }}>Trang {pageIndex + 1}</div>
              );
            })}
            
            <SelectedTemplate 
              cvData={cvData} 
              onUpdateSectionData={handleUpdateSectionData}
              onSectionClick={(id) => {
                setSelectedSection(id);
                setActiveTab("design");
                setIsPanelOpen(true);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVBuilderPage;