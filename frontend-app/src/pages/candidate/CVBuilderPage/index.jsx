import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import Modal from "../../../components/common/Modal";
import { useParams, useNavigate } from "react-router-dom";
import {
  Palette,
  Eye,
  LayoutList,
  LayoutTemplate,
  Loader,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { captureCvThumbnailAsFile } from "../../../components/cv-builder/shared/captureCvThumbnail";

import TabPanel from "../../../components/cv-builder/sidebar/TabPanel";
import DraggableItem from "../../../components/cv-builder/sidebar/DraggableItem";
import authService from "../../../features/auth/authService";
import candidateService from "../../../features/candidate/candidateService";

import SimpleTemplate, {
  SIMPLE_TEMPLATE_CONFIG,
} from "../../../components/cv-builder/templates/SimpleTemplate";
import {
  CV_PAGE_WIDTH_PX,
  CV_PAGE_HEIGHT_PX,
  applyCvPageBreaks,
} from "../../../components/cv-builder/templates/cvTemplateCore";
// import HarvardTemplate, { HARVARD_TEMPLATE_CONFIG } from "../../../components/cv-builder/templates/HarvardTemplate";
// import ProfessionalTemplate, { PROFESSIONAL_TEMPLATE_CONFIG } from "../../../components/cv-builder/templates/ProfessionalTemplate";

const TEMPLATE_REGISTRY = {
  simple: { component: SimpleTemplate, config: SIMPLE_TEMPLATE_CONFIG },
  // harvard: { component: HarvardTemplate, config: HARVARD_TEMPLATE_CONFIG },
  // professional: { component: ProfessionalTemplate, config: PROFESSIONAL_TEMPLATE_CONFIG },
};

const wlBuilderStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .wl-builder, .wl-builder * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

  /* Không cho font UI (Inter) của khung xây dựng "rò" vào vùng nội dung CV bên trong.
     Nếu không có dòng này, mọi phần tử trong CV (h1, h2, span...) đều bị ép cứng về Inter
     (vì selector .wl-builder * áp trực tiếp lên từng phần tử con, thắng cả inheritance),
     khiến việc đổi "Font chữ toàn CV" (settings.font) không có tác dụng gì trên màn hình live.
     unset -> quay về kế thừa bình thường từ style inline (fontFamily: settings.font). */
  .wl-builder .cv-paper-root, .wl-builder .cv-paper-root * { font-family: unset; }

  .wl-builder-root { background: #F0F4FF; }

  .wl-builder-header {
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid #E2E8F0;
  }

  .wl-back-btn { color: #64748B; transition: all 0.2s ease; }
  .wl-back-btn:hover { color: #2563EB; background: #EFF6FF; transform: translateX(-2px); }

  .wl-title-input {
    color: #0F172A;
    border-bottom: 2px solid transparent;
    transition: border-color 0.2s ease;
  }
  .wl-title-input:hover { border-bottom-color: #E2E8F0; }
  .wl-title-input:focus { border-bottom-color: #2563EB; outline: none; }

  .wl-dirty-badge { color: #D97706; background: #FFFBEB; border: 1px solid #FDE68A; }

  .wl-save-btn {
    background: linear-gradient(135deg, #2563EB 0%, #14B8A6 100%);
    color: #fff;
    box-shadow: 0 4px 14px rgba(37,99,235,0.28);
    transition: all 0.2s ease;
  }
  .wl-save-btn:hover:not(:disabled) {
    box-shadow: 0 6px 18px rgba(37,99,235,0.38);
    transform: translateY(-1px);
  }
  .wl-save-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  .wl-sidebar { background: #fff; border-right: 1px solid #E2E8F0; }

  .wl-tab-btn { color: #64748B; transition: all 0.2s ease; position: relative; }
  .wl-tab-btn:hover { background: #F8FAFC; color: #2563EB; }
  .wl-tab-btn.active {
    background: linear-gradient(135deg, #EFF6FF 0%, #ECFDF5 100%);
    color: #2563EB;
    box-shadow: inset 0 0 0 1px #BFDBFE;
  }
  .wl-tab-dot {
    position: absolute; left: 4px; width: 3px; height: 22px; border-radius: 4px;
    background: linear-gradient(180deg, #2563EB, #14B8A6);
    opacity: 0; transition: opacity 0.2s ease;
  }
  .wl-tab-btn.active .wl-tab-dot { opacity: 1; }

  .wl-canvas { background: linear-gradient(160deg, #E8EEFD 0%, #DCE6FB 100%); }

  .wl-page-tag {
    background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
    color: #fff;
    box-shadow: 0 4px 10px rgba(37,99,235,0.3);
  }

  .wl-toast { backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); border-radius: 12px; }

  /* Dùng khi chụp thumbnail: tắt hẳn mọi transition để dom-to-image-more
     không bao giờ bắt phải khung hình đang chuyển động dở dang. */
  .wl-no-transition, .wl-no-transition * { transition: none !important; }
`;

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

  const [cvTitle, setCvTitle] = useState("CV chưa có tên");
  const [initialDataStr, setInitialDataStr] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const defaultTemplateConfig = TEMPLATE_REGISTRY.simple.config;

  const [cvData, setCvData] = useState({
    settings: defaultTemplateConfig.defaultSettings,
    layout: defaultTemplateConfig.defaultLayout,
    data: defaultTemplateConfig.defaultData,
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPageCount, setPreviewPageCount] = useState(1);
  const previewContentRefs = useRef([]);
  const [thumbnailPath, setThumbnailPath] = useState(null);
  const thumbnailUrl = thumbnailPath
    ? `http://localhost:8080${thumbnailPath}?t=${Date.now()}`
    : null;

  useEffect(() => {
    if (!paperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.contentRect.height;
        const pages = Math.max(1, Math.ceil((height - 5) / CV_PAGE_HEIGHT_PX));
        setTotalPages(pages);
      }
    });
    observer.observe(paperRef.current);
    return () => observer.disconnect();
  }, [uiState.isLoading]);

  useEffect(() => {
    if (isPreviewOpen) setPreviewPageCount(totalPages);
  }, [isPreviewOpen, totalPages]);

  useLayoutEffect(() => {
    if (!isPreviewOpen) return;

    const raf = requestAnimationFrame(() => {
      let measuredHeight = 0;
      previewContentRefs.current.forEach((el, idx) => {
        if (!el) return;
        const { height } = applyCvPageBreaks(el, {
          pageHeight: CV_PAGE_HEIGHT_PX,
        });
        if (idx === 0) measuredHeight = height;
      });
      if (measuredHeight > 0) {
        const correctedCount = Math.max(
          1,
          Math.ceil(measuredHeight / CV_PAGE_HEIGHT_PX),
        );
        setPreviewPageCount((prev) =>
          prev === correctedCount ? prev : correctedCount,
        );
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [isPreviewOpen, cvData, previewPageCount]);

  useEffect(() => {
    const fetchCvData = async () => {
      if (!cvId) {
        const initialStr = JSON.stringify({
          title: "CV chưa có tên",
          data: cvData,
        });
        setInitialDataStr(initialStr);
        return;
      }

      const currentUser = authService.getCurrentUser();
      if (!currentUser?.userId) return;

      setUiState((prev) => ({ ...prev, isLoading: true }));
      try {
        const response = await candidateService.getCvDetail(
          currentUser.userId,
          cvId,
        );
        const fetchedCv = response.data;

        if (fetchedCv && fetchedCv.rawText) {
          setThumbnailPath(fetchedCv.thumbnailPath);
          const parsedData = JSON.parse(fetchedCv.rawText);
          const templateName = parsedData.settings?.template || "simple";
          const tplConfig =
            TEMPLATE_REGISTRY[templateName]?.config ||
            TEMPLATE_REGISTRY.simple.config;

          const loadedData = {
            settings: {
              ...tplConfig.defaultSettings,
              ...(parsedData.settings || {}),
            },
            layout: parsedData.layout || tplConfig.defaultLayout,
            data: {
              ...tplConfig.defaultData,
              ...(parsedData.data || parsedData),
            },
          };

          const actualTitle =
            fetchedCv.title ||
            fetchedCv.name ||
            fetchedCv.fileName ||
            "CV_Tu_Tao";

          setCvData(loadedData);
          setCvTitle(actualTitle);

          setInitialDataStr(
            JSON.stringify({ title: actualTitle, data: loadedData }),
          );
        }
      } catch (error) {
        console.error("Lỗi khi tải CV:", error);
        showToastMsg("Không thể tải thông tin CV này.", "error");
      } finally {
        setUiState((prev) => ({ ...prev, isLoading: false }));
      }
    };
    fetchCvData();
  }, [cvId]);

  useEffect(() => {
    if (initialDataStr) {
      const currentDataStr = JSON.stringify({ title: cvTitle, data: cvData });
      setIsDirty(currentDataStr !== initialDataStr);
    }
  }, [cvTitle, cvData, initialDataStr]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue =
          "Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn thoát?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const showToastMsg = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(
      () => setToast({ visible: false, message: "", type: "success" }),
      3000,
    );
  };

  const handleGoBack = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        "Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn thoát?",
      );
      if (!confirmLeave) return;
    }
    navigate("/candidate/cv-manager");
  };

  const handleSaveCv = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser?.userId) {
      showToastMsg("Vui lòng đăng nhập để lưu CV.", "error");
      return;
    }

    setSelectedSection(null);
    await new Promise((resolve) => setTimeout(resolve, 150));

    setUiState((prev) => ({ ...prev, isSaving: true }));
    try {
      const payload = {
        title: cvTitle,
        rawText: JSON.stringify(cvData),
      };

      let savedCvId = cvId;

      if (cvId) {
        await candidateService.updateCv(currentUser.userId, cvId, payload);
      } else {
        const res = await candidateService.createCv(
          currentUser.userId,
          payload,
        );
        savedCvId = res.data.id;
      }

      await candidateService.renameCv(currentUser.userId, savedCvId, cvTitle);

      try {
        const thumbnailFile = await captureCvThumbnailAsFile(
          paperRef.current,
          `cv_thumbnail_${savedCvId}.jpg`,
        );
        await candidateService.uploadCvThumbnail(
          currentUser.userId,
          savedCvId,
          thumbnailFile,
        );

        setInitialDataStr(JSON.stringify({ title: cvTitle, data: cvData }));
        setIsDirty(false);
        showToastMsg("Lưu CV và tạo ảnh thu nhỏ thành công!");
      } catch (imageError) {
        console.error("Lỗi khi chụp ảnh CV:", imageError);
        setInitialDataStr(JSON.stringify({ title: cvTitle, data: cvData }));
        setIsDirty(false);
        showToastMsg(
          "Đã lưu dữ liệu CV, nhưng không tạo được ảnh thu nhỏ.",
          "warning",
        );
      }

      setTimeout(() => {
        navigate("/candidate/cv-manager");
      }, 500);
    } catch (error) {
      console.error("Lỗi khi kết nối với máy chủ:", error);
      showToastMsg("Đã xảy ra lỗi khi lưu CV. Vui lòng thử lại!", "error");
    } finally {
      setUiState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const updateLayout = (newLayout) =>
    setCvData((prev) => ({ ...prev, layout: newLayout }));

  const handleSettingChange = (key, value) => {
    setCvData((prev) => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
    }));
  };

  const handleTemplateChange = (templateName) => {
    const entry = TEMPLATE_REGISTRY[templateName];
    if (!entry) return;

    setCvData((prev) => ({
      settings: {
        ...entry.config.defaultSettings,
        ...prev.settings,
        template: templateName,
      },
      layout: entry.config.defaultLayout,
      data: prev.data,
    }));
  };

  const getSectionSortIndex = (id) => {
    const currentTemplate = cvData.settings.template;
    const orderArray =
      TEMPLATE_REGISTRY[currentTemplate]?.config.sectionOrder ||
      TEMPLATE_REGISTRY.simple.config.sectionOrder;
    const idx = orderArray.indexOf(id);
    return idx === -1 ? 99 : idx;
  };

  const handleAddRow = () => {
    let newLayout = JSON.parse(JSON.stringify(cvData.layout));
    newLayout.activeRows.push({
      id: `row-${Date.now()}`,
      ratio: "10-0",
      leftItems: [],
      rightItems: [],
    });
    updateLayout(newLayout);
  };

  const handleDeleteRow = (rowId) => {
    let newLayout = JSON.parse(JSON.stringify(cvData.layout));
    const rowToDelete = newLayout.activeRows.find((r) => r.id === rowId);
    if (!rowToDelete) return;
    const itemsToRecover = [
      ...rowToDelete.leftItems,
      ...rowToDelete.rightItems,
    ];
    newLayout.unusedItems = [...newLayout.unusedItems, ...itemsToRecover];
    newLayout.unusedItems.sort(
      (a, b) => getSectionSortIndex(a) - getSectionSortIndex(b),
    );
    newLayout.activeRows = newLayout.activeRows.filter((r) => r.id !== rowId);
    updateLayout(newLayout);
  };

  const handleMoveRow = (index, direction) => {
    let newLayout = JSON.parse(JSON.stringify(cvData.layout));
    const rows = newLayout.activeRows;
    if (direction === "up" && index > 0)
      [rows[index - 1], rows[index]] = [rows[index], rows[index - 1]];
    else if (direction === "down" && index < rows.length - 1)
      [rows[index + 1], rows[index]] = [rows[index], rows[index + 1]];
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
      data: { ...prevCvData.data, [sectionId]: updatedData },
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
    if (activeId.startsWith("unused-"))
      source = {
        type: "unused",
        list: newLayout.unusedItems,
        index: newLayout.unusedItems.indexOf(rawActiveId),
      };
    else
      newLayout.activeRows.forEach((row) => {
        if (row.leftItems.includes(rawActiveId))
          source = {
            type: "active",
            list: row.leftItems,
            index: row.leftItems.indexOf(rawActiveId),
            rowId: row.id,
            col: "left",
          };
        if (row.rightItems.includes(rawActiveId))
          source = {
            type: "active",
            list: row.rightItems,
            index: row.rightItems.indexOf(rawActiveId),
            rowId: row.id,
            col: "right",
          };
      });

    let dest = { type: null, list: null, index: -1, rowId: null, col: null };
    if (overId.startsWith("unused-") || overId === "unused-pool")
      dest = {
        type: "unused",
        list: newLayout.unusedItems,
        index:
          overId === "unused-pool"
            ? newLayout.unusedItems.length
            : newLayout.unusedItems.indexOf(rawOverId),
      };
    else if (overId.startsWith("droppable-")) {
      const parts = overId.split("-");
      const rId = `row-${parts[2]}`;
      const cId = parts[3];
      const row = newLayout.activeRows.find((r) => r.id === rId);
      dest = {
        type: "active",
        list: cId === "left" ? row.leftItems : row.rightItems,
        index: -1,
        rowId: rId,
        col: cId,
      };
    } else
      newLayout.activeRows.forEach((row) => {
        if (row.leftItems.includes(rawOverId))
          dest = {
            type: "active",
            list: row.leftItems,
            index: row.leftItems.indexOf(rawOverId),
            rowId: row.id,
            col: "left",
          };
        if (row.rightItems.includes(rawOverId))
          dest = {
            type: "active",
            list: row.rightItems,
            index: row.rightItems.indexOf(rawOverId),
            rowId: row.id,
            col: "right",
          };
      });

    if (!source.type || !dest.type) return;

    if (source.list === dest.list) {
      const updatedList = arrayMove(
        source.list,
        source.index,
        dest.index !== -1 ? dest.index : dest.list.length - 1,
      );
      if (source.type === "unused") newLayout.unusedItems = updatedList;
      else {
        const row = newLayout.activeRows.find((r) => r.id === source.rowId);
        if (source.col === "left") row.leftItems = updatedList;
        else row.rightItems = updatedList;
      }
      return updateLayout(newLayout);
    }

    if (
      source.type === "unused" &&
      rawActiveId === "customSection" &&
      dest.type === "active"
    ) {
      const newCustomId = `customSection_${Date.now()}`;
      if (dest.index === -1) dest.list.push(newCustomId);
      else dest.list.splice(dest.index, 0, newCustomId);
      return setCvData((prev) => ({
        ...prev,
        layout: newLayout,
        data: {
          ...prev.data,
          [newCustomId]: { title: "Thông tin thêm", content: "" },
        },
      }));
    }

    const itemToMove = rawActiveId;
    source.list.splice(source.index, 1);

    if (dest.type === "unused" && itemToMove.startsWith("customSection_")) {
      return setCvData((prev) => {
        const newData = { ...prev.data };
        delete newData[itemToMove];
        return { ...prev, layout: newLayout, data: newData };
      });
    }

    if (dest.index === -1) dest.list.push(itemToMove);
    else dest.list.splice(dest.index, 0, itemToMove);

    newLayout.unusedItems.sort(
      (a, b) => getSectionSortIndex(a) - getSectionSortIndex(b),
    );
    updateLayout(newLayout);
  };

  const handleChangeRatio = (rowId, newRatio) => {
    let newLayout = JSON.parse(JSON.stringify(cvData.layout));
    newLayout.activeRows = newLayout.activeRows.map((row) => {
      if (row.id === rowId) {
        const oldIsOneCol = row.ratio === "10-0" || row.ratio === "100-0";
        const newIsOneCol = newRatio === "10-0" || newRatio === "100-0";
        let newLeft = [...row.leftItems];
        let newRight = [...row.rightItems];

        if (!oldIsOneCol && newIsOneCol) {
          newLeft = [...newLeft, ...newRight];
          newRight = [];
        } else if (oldIsOneCol && !newIsOneCol) {
          const mid = Math.ceil(newLeft.length / 2);
          newRight = newLeft.splice(mid);
        }
        return {
          ...row,
          ratio: newRatio,
          leftItems: newLeft,
          rightItems: newRight,
        };
      }
      return row;
    });
    updateLayout(newLayout);
  };

  const SelectedTemplate =
    TEMPLATE_REGISTRY[cvData.settings.template]?.component ?? SimpleTemplate;

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

  if (uiState.isLoading) {
    return (
      <>
        <style>{wlBuilderStyles}</style>
        <div className="wl-builder wl-builder-root flex h-screen items-center justify-center gap-3">
          <Loader className="w-8 h-8 text-[#2563EB] animate-spin" />
          <span className="text-[#475569] font-medium">
            Đang tải CV của bạn...
          </span>
        </div>
      </>
    );
  }

  return (
    <div className="wl-builder wl-builder-root flex flex-col h-screen">
      <style>{wlBuilderStyles}</style>
      {toast.visible && (
        <div
          className={`wl-toast fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 shadow-lg text-white transition-opacity duration-300 ${
            toast.type === "error"
              ? "bg-red-500/95"
              : toast.type === "warning"
                ? "bg-amber-500/95"
                : "bg-gradient-to-r from-[#2563EB] to-[#14B8A6]"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 size={20} />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      <header className="wl-builder-header h-14 flex items-center justify-between px-4 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="wl-back-btn flex items-center justify-center w-9 h-9 rounded-full"
            title="Quay lại danh sách CV"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={cvTitle}
              onChange={(e) => setCvTitle(e.target.value)}
              className="wl-title-input font-bold text-lg bg-transparent px-1 py-1 w-64"
              placeholder="Nhập tên CV..."
              title="Nhấn để đổi tên CV"
            />
            {isDirty && (
              <span className="wl-dirty-badge text-xs font-medium italic px-2 py-1 rounded-full">
                *Chưa lưu
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors"
          >
            <Eye size={18} />
            Xem trước
          </button>

          <button
            onClick={handleSaveCv}
            disabled={uiState.isSaving || (!isDirty && !!cvId)}
            className="wl-save-btn px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            {uiState.isSaving && <Loader className="w-4 h-4 animate-spin" />}
            {uiState.isSaving
              ? "Đang lưu..."
              : isDirty
                ? "Lưu thay đổi"
                : "Đã lưu"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="wl-sidebar w-[150px] z-20 shadow-sm flex flex-col items-center py-4 gap-3">
          <button
            onClick={() => {
              setActiveTab("design");
              setIsPanelOpen(true);
            }}
            className={`wl-tab-btn p-3 rounded-lg flex flex-col items-center w-[110px] ${activeTab === "design" && isPanelOpen ? "active" : ""}`}
          >
            <span className="wl-tab-dot" />
            <Palette size={20} />
            <span className="text-[10px] mt-1 font-medium text-center">
              Thiết kế
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab("layout");
              setIsPanelOpen(true);
            }}
            className={`wl-tab-btn p-3 rounded-lg flex flex-col items-center w-[110px] ${activeTab === "layout" && isPanelOpen ? "active" : ""}`}
          >
            <span className="wl-tab-dot" />
            <LayoutList size={20} />
            <span className="text-[10px] mt-1 font-medium">Bố cục</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("template");
              setIsPanelOpen(true);
            }}
            className={`wl-tab-btn p-3 rounded-lg flex flex-col items-center w-[110px] ${activeTab === "template" && isPanelOpen ? "active" : ""}`}
          >
            <span className="wl-tab-dot" />
            <LayoutTemplate size={20} />
            <span className="text-[10px] mt-1 font-medium text-center">
              Mẫu CV
            </span>
          </button>
        </div>

        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <TabPanel
            activeTab={activeTab}
            isPanelOpen={isPanelOpen}
            setIsPanelOpen={setIsPanelOpen}
            cvData={cvData}
            setCvData={setCvData}
            handleFontChange={handleFontChange}
            handleColorChange={handleColorChange}
            handleTemplateChange={handleTemplateChange}
            handleDragEnd={handleDragEnd}
            handleChangeRatio={handleChangeRatio}
            handleAddRow={handleAddRow}
            handleDeleteRow={handleDeleteRow}
            handleMoveRow={handleMoveRow}
            handleSettingChange={handleSettingChange}
            selectedSection={selectedSection}
          />
          <DragOverlay>{renderDragOverlay()}</DragOverlay>
        </DndContext>

        <div
          className="wl-canvas flex-1 overflow-y-auto relative flex justify-center py-10 transition-all"
          style={{ marginLeft: isPanelOpen ? "10px" : "0" }}
          onClick={() => {
            setSelectedSection(null);
          }}
        >
          <div
            ref={paperRef}
            className="cv-paper-root h-fit bg-white shadow-xl relative rounded-sm"
            style={{
              width: `${CV_PAGE_WIDTH_PX}px`,
              minHeight: `${CV_PAGE_HEIGHT_PX}px`,
              backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${CV_PAGE_HEIGHT_PX - 1}px, #2563EB ${CV_PAGE_HEIGHT_PX - 1}px, #2563EB ${CV_PAGE_HEIGHT_PX + 1}px)`,
              backgroundSize: `100% ${CV_PAGE_HEIGHT_PX}px`,
            }}
          >
            {totalPages > 1 &&
              Array.from({ length: totalPages - 1 }).map((_, i) => {
                const pageIndex = i + 1;
                return (
                  <div
                    key={pageIndex}
                    className="wl-page-tag absolute left-[-55px] text-[10px] px-2 py-1 rounded shadow-sm z-50 font-medium"
                    style={{
                      top: `${pageIndex * CV_PAGE_HEIGHT_PX}px`,
                      transform: "translateY(-50%)",
                    }}
                  >
                    Trang {pageIndex + 1}
                  </div>
                );
              })}

            <SelectedTemplate
              cvData={cvData}
              selectedSection={selectedSection}
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
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Bản xem trước CV"
      >
        <div
          className="bg-gray-200 overflow-y-auto flex flex-col items-center gap-8 p-4 sm:p-8"
          style={{
            maxHeight: "85vh",
            width: "100%",
            minWidth: "min(850px, 95vw)",
          }}
        >
          {Array.from({ length: previewPageCount }).map((_, pageIndex) => (
            <div
              key={pageIndex}
              className="relative bg-white shadow-2xl rounded-sm overflow-hidden shrink-0"
              style={{
                width: `${CV_PAGE_WIDTH_PX}px`,
                maxWidth: "100%",
                height: `${CV_PAGE_HEIGHT_PX}px`,
              }}
            >
              <div
                ref={(el) => {
                  previewContentRefs.current[pageIndex] = el;
                }}
                className="absolute top-0 left-0 w-full pointer-events-none select-none"
                style={{
                  transform: `translateY(-${pageIndex * CV_PAGE_HEIGHT_PX}px)`,
                }}
              >
                <SelectedTemplate
                  cvData={cvData}
                  selectedSection={null}
                  onSectionClick={() => {}}
                  onUpdateSectionData={() => {}}
                />
              </div>

              <span className="absolute bottom-2 right-3 text-[11px] text-gray-400 font-medium bg-white/80 px-1.5 py-0.5 rounded">
                Trang {pageIndex + 1}/{previewPageCount}
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default CVBuilderPage;