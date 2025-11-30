import React, { useState, useEffect } from 'react';
import { Calendar, Download, Plus, Trash2, CheckCircle, TrendingUp, Users, Search, BookOpen, Target, MessageCircle, Lightbulb, Rocket, Edit2, Image, Video, Settings } from 'lucide-react';

export default function ObservationTracker({ initialTab = 1 }) {
  // 프로젝트 관리
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  // 설정 패널
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState('');
  const [autoBackup, setAutoBackup] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempUserName, setTempUserName] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [tempProjectName, setTempProjectName] = useState('');
  
  // 새 프로젝트 생성 모달
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  // AI 사용 횟수 제한 (하루 3회)
  const AI_DAILY_LIMIT = 3;
  
  const getAIUsageToday = () => {
    const stored = localStorage.getItem('aiUsage');
    if (!stored) return { date: '', count: 0 };
    
    const usage = JSON.parse(stored);
    const today = new Date().toDateString();
    
    // 날짜가 다르면 리셋
    if (usage.date !== today) {
      return { date: today, count: 0 };
    }
    return usage;
  };

  const getRemainingAIUsage = () => {
    const usage = getAIUsageToday();
    return Math.max(0, AI_DAILY_LIMIT - usage.count);
  };

  const incrementAIUsage = () => {
    const today = new Date().toDateString();
    const usage = getAIUsageToday();
    const newUsage = {
      date: today,
      count: usage.count + 1
    };
    localStorage.setItem('aiUsage', JSON.stringify(newUsage));
  };

  const canUseAI = () => {
    return getRemainingAIUsage() > 0;
  };
  
  const [activeWeek, setActiveWeek] = useState(initialTab);
  const [observations, setObservations] = useState([]);
  const [patterns, setPatterns] = useState([]);
  
  // 아이디어 관련 state
  const [ideas, setIdeas] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [newIdea, setNewIdea] = useState({ name: '', description: '' });
  const [editingIdeaId, setEditingIdeaId] = useState(null);
  
  // 검증 데이터 (아이디어별로 저장)
  const [validationData, setValidationData] = useState({});
  
  const [newObs, setNewObs] = useState('');
  const [showGuide, setShowGuide] = useState(true);
  const [categories, setCategories] = useState(['직장 업무', '개인 시간 관리', '소비 패턴']);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAnalysisCategory, setSelectedAnalysisCategory] = useState('전체');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [aiPatterns, setAiPatterns] = useState([]);
  
  // 빠른 카테고리 추가 모달
  const [showQuickCategoryModal, setShowQuickCategoryModal] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState('');
  
  // MVP AI 추천 관련
  const [mvpPlan, setMvpPlan] = useState(null);
  const [isGeneratingMVP, setIsGeneratingMVP] = useState(false);

  // IndexedDB 초기화 및 관리
  const initDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ObservationTrackerDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
      };
    });
  };

  const saveProjectToDB = async (project) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      store.put(project);
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('프로젝트 저장 실패:', error);
    }
  };

  const loadProjectsFromDB = async () => {
    try {
      const db = await initDB();
      const transaction = db.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('프로젝트 로딩 실패:', error);
      return [];
    }
  };

  const deleteProjectFromDB = async (projectId) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      store.delete(projectId);
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error);
    }
  };

  // 프로젝트 생성
  const createNewProject = async (name = null) => {
    const newProject = {
      id: Date.now().toString(),
      name: name || `프로젝트 ${projects.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentWeek: 1,
      data: {
        observations: [],
        patterns: [],
        categories: ['직장 업무', '개인 시간 관리', '소비 패턴'],
        aiPatterns: [],
        analysisComplete: false,
        ideas: [],
        selectedIdeaId: null,
        validationData: {},
        mvpPlan: null
      }
    };
    
    setProjects(prev => [...prev, newProject]);
    setCurrentProjectId(newProject.id);
    loadProjectData(newProject);
    await saveProjectToDB(newProject);
    setActiveWeek(1);
    
    return newProject;
  };

  // 프로젝트 데이터 로드
  const loadProjectData = (project) => {
    setObservations(project.data.observations || []);
    setPatterns(project.data.patterns || []);
    setCategories(project.data.categories || ['직장 업무', '개인 시간 관리', '소비 패턴']);
    setAiPatterns(project.data.aiPatterns || []);
    setAnalysisComplete(project.data.analysisComplete || false);
    setIdeas(project.data.ideas || []);
    setSelectedIdeaId(project.data.selectedIdeaId || null);
    setValidationData(project.data.validationData || {});
    setMvpPlan(project.data.mvpPlan || null);
    setActiveWeek(project.currentWeek || 1);
  };

  // 현재 프로젝트 저장
  const saveCurrentProject = async () => {
    if (!currentProjectId) return;
    
    const currentProject = projects.find(p => p.id === currentProjectId);
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      updatedAt: new Date().toISOString(),
      currentWeek: activeWeek,
      data: {
        observations,
        patterns,
        categories,
        aiPatterns,
        analysisComplete,
        ideas,
        selectedIdeaId,
        validationData,
        mvpPlan
      }
    };

    setProjects(projects.map(p => p.id === currentProjectId ? updatedProject : p));
    await saveProjectToDB(updatedProject);
  };

  // 프로젝트 전환
  const switchProject = (projectId) => {
    if (currentProjectId) {
      saveCurrentProject();
    }
    
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProjectId(projectId);
      loadProjectData(project);
    }
  };

  // 프로젝트 이름 변경
  const renameProject = async (projectId, newName) => {
    let updatedProject = null;
    
    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id === projectId) {
          updatedProject = { ...p, name: newName, updatedAt: new Date().toISOString() };
          return updatedProject;
        }
        return p;
      });
      return updated;
    });
    
    // 약간의 지연 후 DB 업데이트
    setTimeout(async () => {
      if (updatedProject) {
        await saveProjectToDB(updatedProject);
      }
    }, 100);
  };

  // 프로젝트 복사
  const duplicateProject = async (projectId) => {
    const original = projects.find(p => p.id === projectId);
    if (!original) return;

    const duplicate = {
      ...original,
      id: Date.now().toString(),
      name: `${original.name} (사본)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProjects(prev => [...prev, duplicate]);
    await saveProjectToDB(duplicate);
  };

  // 프로젝트 삭제
  const confirmDeleteProject = (projectId) => {
    console.log('삭제 확인 모달 열기:', projectId);
    setProjectToDelete(projectId);
  };

  const deleteProject = async () => {
    const projectId = projectToDelete;
    console.log('삭제 시도:', projectId);
    
    if (!projectId) {
      console.log('프로젝트 ID 없음');
      return;
    }

    try {
      console.log('DB에서 삭제 시작...');
      await deleteProjectFromDB(projectId);
      console.log('DB 삭제 완료');
      
      // 현재 프로젝트인지 확인
      const isCurrentProject = currentProjectId === projectId;
      console.log('현재 프로젝트인가?', isCurrentProject);
      
      // 업데이트할 프로젝트 리스트
      const remainingProjects = projects.filter(p => p.id !== projectId);
      console.log('남은 프로젝트 수:', remainingProjects.length);
      
      setProjects(remainingProjects);
      
      // 현재 프로젝트였다면 다른 프로젝트로 전환
      if (isCurrentProject) {
        if (remainingProjects.length > 0) {
          console.log('다른 프로젝트로 전환:', remainingProjects[0].name);
          setCurrentProjectId(remainingProjects[0].id);
          loadProjectData(remainingProjects[0]);
        } else {
          console.log('프로젝트가 모두 삭제됨');
          setCurrentProjectId(null);
          setObservations([]);
          setPatterns([]);
          setCategories(['직장 업무', '개인 시간 관리', '소비 패턴']);
          setAiPatterns([]);
          setAnalysisComplete(false);
          setIdeas([]);
          setSelectedIdeaId(null);
          setValidationData({});
          setMvpPlan(null);
          setActiveWeek(1);
        }
      }
      
      console.log('삭제 완료!');
      setProjectToDelete(null);
      alert('프로젝트가 삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('프로젝트 삭제에 실패했습니다: ' + error.message);
      setProjectToDelete(null);
    }
  };

  const cancelDelete = () => {
    console.log('삭제 취소됨');
    setProjectToDelete(null);
  };

  // 설정 관리
  const startEditingName = () => {
    setTempUserName(userName);
    setIsEditingName(true);
  };

  const saveUserName = () => {
    if (tempUserName.trim()) {
      setUserName(tempUserName.trim());
      localStorage.setItem('userName', tempUserName.trim());
      setIsEditingName(false);
    } else {
      alert('이름을 입력해주세요.');
    }
  };

  const cancelEditingName = () => {
    setTempUserName(userName);
    setIsEditingName(false);
  };

  const startEditingProject = (projectId, currentName) => {
    setEditingProjectId(projectId);
    setTempProjectName(currentName);
  };

  const saveProjectName = async (projectId) => {
    if (tempProjectName.trim() && tempProjectName !== projects.find(p => p.id === projectId)?.name) {
      await renameProject(projectId, tempProjectName.trim());
      setEditingProjectId(null);
      setTempProjectName('');
    } else if (!tempProjectName.trim()) {
      alert('프로젝트 이름을 입력해주세요.');
    } else {
      setEditingProjectId(null);
      setTempProjectName('');
    }
  };

  const cancelEditingProject = () => {
    setEditingProjectId(null);
    setTempProjectName('');
  };

  // 새 프로젝트 생성 모달
  const openNewProjectModal = () => {
    setNewProjectName('');
    setShowNewProjectModal(true);
  };

  const closeNewProjectModal = () => {
    setNewProjectName('');
    setShowNewProjectModal(false);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      alert('프로젝트 이름을 입력해주세요.');
      return;
    }
    
    await createNewProject(newProjectName.trim());
    setShowNewProjectModal(false);
    setNewProjectName('');
    setActiveWeek(1); // 불편함 수집 단계로 이동
  };

  const toggleAutoBackup = () => {
    const newValue = !autoBackup;
    setAutoBackup(newValue);
    localStorage.setItem('autoBackup', newValue.toString());
  };

  const backupAllProjects = () => {
    if (projects.length === 0) {
      alert('백업할 프로젝트가 없습니다.');
      return;
    }

    const backupData = {
      version: '1.0',
      backupDate: new Date().toISOString(),
      userName: userName,
      projects: projects,
      categories: categories,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `전체백업-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    alert('모든 프로젝트가 백업되었습니다!');
  };

  const calculateStorageSize = () => {
    const dataSize = JSON.stringify(projects).length;
    const sizeInKB = (dataSize / 1024).toFixed(2);
    const sizeInMB = (dataSize / (1024 * 1024)).toFixed(2);
    
    if (dataSize < 1024) {
      return `${dataSize} bytes`;
    } else if (dataSize < 1024 * 1024) {
      return `${sizeInKB} KB`;
    } else {
      return `${sizeInMB} MB`;
    }
  };

  const clearAllData = async () => {
    if (!confirm('⚠️ 정말로 모든 데이터를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.\n계속하기 전에 백업을 권장합니다.')) {
      return;
    }

    if (!confirm('⚠️ 마지막 확인: 정말로 삭제하시겠습니까?')) {
      return;
    }

    try {
      // 모든 프로젝트 삭제
      for (const project of projects) {
        await deleteProjectFromDB(project.id);
      }

      // State 초기화
      setProjects([]);
      setCurrentProjectId(null);
      setObservations([]);
      setPatterns([]);
      setCategories(['직장 업무', '개인 시간 관리', '소비 패턴']);
      setAiPatterns([]);
      setAnalysisComplete(false);
      setIdeas([]);
      setSelectedIdeaId(null);
      setValidationData({});
      setMvpPlan(null);
      setActiveWeek(1);

      alert('모든 데이터가 삭제되었습니다.');
      
      // 새 프로젝트 자동 생성
      await createNewProject('첫 번째 프로젝트');
    } catch (error) {
      console.error('데이터 삭제 실패:', error);
      alert('데이터 삭제 중 오류가 발생했습니다.');
    }
  };

  // 자동 백업 (매일 1회)
  useEffect(() => {
    if (!autoBackup || projects.length === 0) return;

    const lastBackup = localStorage.getItem('lastAutoBackup');
    const today = new Date().toDateString();

    if (lastBackup !== today) {
      console.log('자동 백업 실행...');
      backupAllProjects();
      localStorage.setItem('lastAutoBackup', today);
    }
  }, [autoBackup, projects]);

  // 초기 로딩
  useEffect(() => {
    const loadInitialData = async () => {
      // 프로젝트 로딩
      const loadedProjects = await loadProjectsFromDB();
      
      if (loadedProjects.length > 0) {
        setProjects(loadedProjects);
        const lastProject = loadedProjects[loadedProjects.length - 1];
        setCurrentProjectId(lastProject.id);
        loadProjectData(lastProject);
      } else {
        await createNewProject('첫 번째 프로젝트');
      }
      
      // 사용자 설정 로딩
      const savedUserName = localStorage.getItem('userName');
      const savedAutoBackup = localStorage.getItem('autoBackup');
      
      if (savedUserName) {
        setUserName(savedUserName);
        setTempUserName(savedUserName);
        setIsEditingName(false);
      } else {
        setIsEditingName(true); // 이름이 없으면 편집 모드로 시작
      }
      
      if (savedAutoBackup) setAutoBackup(savedAutoBackup === 'true');
      
      setIsLoadingProjects(false);
    };

    loadInitialData();
  }, []);

  // 자동 저장 (데이터 변경 시)
  useEffect(() => {
    if (!isLoadingProjects && currentProjectId) {
      const timeoutId = setTimeout(() => {
        saveCurrentProject();
      }, 1000); // 1초 debounce

      return () => clearTimeout(timeoutId);
    }
  }, [observations, patterns, categories, aiPatterns, analysisComplete, ideas, selectedIdeaId, validationData, mvpPlan, activeWeek]);

  // 불편함 기록
  const addObservation = () => {
    if (!newObs.trim()) return;
    if (!selectedCategory) {
      alert('카테고리를 선택해주세요.');
      return;
    }
    setObservations([...observations, {
      id: Date.now(),
      text: newObs,
      category: selectedCategory,
      date: new Date().toLocaleDateString('ko-KR'),
      week: activeWeek
    }]);
    setNewObs('');
  };

  const deleteObservation = (id) => {
    setObservations(observations.filter(obs => obs.id !== id));
  };

  // 카테고리 관리
  const addCategory = () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      alert('이미 존재하는 카테고리입니다.');
      return;
    }
    setCategories([...categories, newCategory.trim()]);
    setNewCategory('');
  };

  // 빠른 카테고리 추가 (드롭다운에서)
  const addQuickCategory = () => {
    if (!quickCategoryName.trim()) return;
    if (categories.includes(quickCategoryName.trim())) {
      alert('이미 존재하는 카테고리입니다.');
      return;
    }
    const newCat = quickCategoryName.trim();
    setCategories([...categories, newCat]);
    setSelectedCategory(newCat);
    setQuickCategoryName('');
    setShowQuickCategoryModal(false);
  };

  const deleteCategory = (category) => {
    if (categories.length <= 1) {
      alert('최소 1개의 카테고리는 필요합니다.');
      return;
    }
    const hasObservations = observations.some(obs => obs.category === category);
    if (hasObservations) {
      if (!confirm(`'${category}' 카테고리에 ${observations.filter(obs => obs.category === category).length}개의 기록이 있습니다. 삭제하시겠습니까?`)) {
        return;
      }
    }
    setCategories(categories.filter(c => c !== category));
    setObservations(observations.filter(obs => obs.category !== category));
  };

  // 패턴 추출
  const addPattern = () => {
    setPatterns([...patterns, { id: Date.now(), name: '', count: 0, observations: [] }]);
  };

  const updatePattern = (id, field, value) => {
    setPatterns(patterns.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const deletePattern = (id) => {
    setPatterns(patterns.filter(p => p.id !== id));
  };

  // AI 패턴 분석
  const analyzeWithAI = async () => {
    // 사용 횟수 체크
    if (!canUseAI()) {
      alert(`오늘의 AI 분석 횟수(${AI_DAILY_LIMIT}회)를 모두 사용했습니다.\n내일 다시 이용해주세요!`);
      return;
    }

    const filteredObs = selectedAnalysisCategory === '전체' 
      ? observations 
      : observations.filter(obs => obs.category === selectedAnalysisCategory);

    if (filteredObs.length < 3) {
      alert('선택한 카테고리에 최소 3개 이상의 불편함이 필요합니다.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);

    try {
      const observationTexts = filteredObs.map(obs => obs.text).join('\n- ');
      
      const prompt = `다음은 사용자가 "${selectedAnalysisCategory}" 영역에서 기록한 불편함 리스트입니다:

- ${observationTexts}

위 불편함들을 분석해서 **반복되는 패턴 TOP 3**를 찾아주세요.

응답은 반드시 아래 JSON 형식으로만 작성해주세요:

{
  "patterns": [
    {
      "name": "패턴 이름 (예: 정보 찾기의 어려움)",
      "count": 반복 횟수,
      "summary": "이 패턴에 해당하는 관찰 내용 요약 (2-3문장)",
      "relatedObservations": ["관련된 원본 불편함 1", "관련된 원본 불편함 2"]
    }
  ]
}

중요:
- 정확히 3개의 패턴을 찾아주세요
- count는 실제 관련된 불편함 개수를 세어주세요
- summary는 왜 이런 패턴이 나타나는지 간략히 설명해주세요
- JSON만 출력하고 다른 텍스트는 포함하지 마세요`;

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          type: "pattern"
        })
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.result;
      
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const result = JSON.parse(responseText);
      
      const newPatterns = result.patterns.map(p => ({
        id: Date.now() + Math.random(),
        name: p.name,
        count: p.count,
        observations: p.summary,
        relatedItems: p.relatedObservations,
        category: selectedAnalysisCategory
      }));

      setAiPatterns(newPatterns);
      setPatterns(newPatterns);
      setAnalysisComplete(true);
      
      // 사용 횟수 증가
      incrementAIUsage();
      
    } catch (error) {
      console.error("AI 분석 오류:", error);
      alert('패턴 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 아이디어 관리
  const saveIdea = () => {
    if (!newIdea.name.trim()) {
      alert('아이디어 이름을 입력해주세요.');
      return;
    }
    
    if (editingIdeaId) {
      // 수정
      setIdeas(ideas.map(idea => 
        idea.id === editingIdeaId 
          ? { ...idea, name: newIdea.name, description: newIdea.description }
          : idea
      ));
      setEditingIdeaId(null);
    } else {
      // 새로 추가
      const ideaId = Date.now();
      setIdeas([...ideas, {
        id: ideaId,
        name: newIdea.name,
        description: newIdea.description,
        createdAt: new Date().toLocaleDateString('ko-KR')
      }]);
      
      // 검증 데이터 초기화
      setValidationData({
        ...validationData,
        [ideaId]: {
          interviews: [],
          onlineValidation: {
            searchResearch: { text: '', images: [], videos: [] },
            competitors: { text: '', images: [], videos: [] },
            community: { text: '', images: [], videos: [] },
            painpoints: { text: '', images: [], videos: [] }
          }
        }
      });
    }
    
    setNewIdea({ name: '', description: '' });
    setShowIdeaModal(false);
  };

  const deleteIdea = (id) => {
    if (!confirm('이 아이디어와 관련된 모든 검증 데이터가 삭제됩니다. 계속하시겠습니까?')) {
      return;
    }
    setIdeas(ideas.filter(idea => idea.id !== id));
    const newValidationData = { ...validationData };
    delete newValidationData[id];
    setValidationData(newValidationData);
    if (selectedIdeaId === id) {
      setSelectedIdeaId(null);
    }
  };

  const editIdea = (idea) => {
    setNewIdea({ name: idea.name, description: idea.description });
    setEditingIdeaId(idea.id);
    setShowIdeaModal(true);
  };

  const applySelectedIdea = () => {
    if (!selectedIdeaId) {
      alert('아이디어를 선택해주세요.');
      return;
    }
    alert('아이디어가 적용되었습니다!');
  };

  // 인터뷰 관리
  const addInterview = () => {
    if (!selectedIdeaId) {
      alert('먼저 아이디어를 선정해주세요.');
      return;
    }
    
    const newInterview = {
      id: Date.now(),
      name: '',
      category: '',
      frequency: '',
      helpScore: 5,
      payment: '',
      memo: ''
    };
    
    setValidationData({
      ...validationData,
      [selectedIdeaId]: {
        ...validationData[selectedIdeaId],
        interviews: [...(validationData[selectedIdeaId]?.interviews || []), newInterview]
      }
    });
  };

  const updateInterview = (id, field, value) => {
    setValidationData({
      ...validationData,
      [selectedIdeaId]: {
        ...validationData[selectedIdeaId],
        interviews: validationData[selectedIdeaId].interviews.map(interview =>
          interview.id === id ? { ...interview, [field]: value } : interview
        )
      }
    });
  };

  const deleteInterview = (id) => {
    setValidationData({
      ...validationData,
      [selectedIdeaId]: {
        ...validationData[selectedIdeaId],
        interviews: validationData[selectedIdeaId].interviews.filter(interview => interview.id !== id)
      }
    });
  };

  // 온라인 검증 업데이트
  const updateOnlineValidation = (section, field, value) => {
    setValidationData({
      ...validationData,
      [selectedIdeaId]: {
        ...validationData[selectedIdeaId],
        onlineValidation: {
          ...validationData[selectedIdeaId].onlineValidation,
          [section]: {
            ...validationData[selectedIdeaId].onlineValidation[section],
            [field]: value
          }
        }
      }
    });
  };

  const addImage = (section, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const currentImages = validationData[selectedIdeaId].onlineValidation[section].images || [];
      updateOnlineValidation(section, 'images', [...currentImages, e.target.result]);
    };
    reader.readAsDataURL(file);
  };

  const addVideo = (section, url) => {
    const currentVideos = validationData[selectedIdeaId].onlineValidation[section].videos || [];
    updateOnlineValidation(section, 'videos', [...currentVideos, url]);
  };

  const removeImage = (section, index) => {
    const currentImages = validationData[selectedIdeaId].onlineValidation[section].images || [];
    updateOnlineValidation(section, 'images', currentImages.filter((_, i) => i !== index));
  };

  const removeVideo = (section, index) => {
    const currentVideos = validationData[selectedIdeaId].onlineValidation[section].videos || [];
    updateOnlineValidation(section, 'videos', currentVideos.filter((_, i) => i !== index));
  };

  // MVP AI 생성
  const generateMVPPlan = async () => {
    // 사용 횟수 체크
    if (!canUseAI()) {
      alert(`오늘의 AI 분석 횟수(${AI_DAILY_LIMIT}회)를 모두 사용했습니다.\n내일 다시 이용해주세요!`);
      return;
    }

    if (!selectedIdeaId) {
      alert('먼저 아이디어를 선정해주세요.');
      return;
    }

    const selectedIdea = ideas.find(idea => idea.id === selectedIdeaId);
    const validation = validationData[selectedIdeaId];

    if (!validation || !validation.interviews || validation.interviews.length === 0) {
      alert('최소 1개 이상의 인터뷰 데이터가 필요합니다.');
      return;
    }

    setIsGeneratingMVP(true);

    try {
      const interviewSummary = validation.interviews.map(int => 
        `- ${int.name}: 빈도 ${int.frequency}, 도움도 ${int.helpScore}/10, 지불의향 ${int.payment}`
      ).join('\n');

      const onlineResearch = `
검색 리서치: ${validation.onlineValidation.searchResearch.text || '없음'}
경쟁사 분석: ${validation.onlineValidation.competitors.text || '없음'}
커뮤니티 분석: ${validation.onlineValidation.community.text || '없음'}
Painpoint 분석: ${validation.onlineValidation.painpoints.text || '없음'}
      `;

      const prompt = `당신은 린 스타트업 전문가입니다. 다음 정보를 바탕으로 MVP 테스트 플랜을 제안해주세요.

**아이디어:**
${selectedIdea.name}
${selectedIdea.description}

**인터뷰 결과:**
${interviewSummary}

**온라인 검증:**
${onlineResearch}

다음 JSON 형식으로 응답해주세요:

{
  "serviceNames": ["서비스명 예시1", "서비스명 예시2", "서비스명 예시3"],
  "coreMessage": "핵심 소구점 (1-2문장)",
  "deliveryMethod": "추천 전달 방식 (랜딩페이지/베타 신청/광고 등)",
  "testPlan": {
    "method": "구체적 테스트 방법",
    "channels": ["채널1", "채널2"],
    "metrics": ["측정 지표1", "측정 지표2"],
    "successCriteria": "성공 기준"
  },
  "timeline": "추천 일정 (예: 2주)",
  "budget": "예상 비용 범위"
}

JSON만 출력하세요.`;

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          type: "mvp"
        })
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.result;
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const result = JSON.parse(responseText);
      setMvpPlan(result);
      
      // 사용 횟수 증가
      incrementAIUsage();
      
    } catch (error) {
      console.error("MVP 생성 오류:", error);
      alert('MVP 플랜 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingMVP(false);
    }
  };

  const updateMVPPlan = (field, value) => {
    setMvpPlan({ ...mvpPlan, [field]: value });
  };

  const updateMVPTestPlan = (field, value) => {
    setMvpPlan({
      ...mvpPlan,
      testPlan: { ...mvpPlan.testPlan, [field]: value }
    });
  };

  // 데이터 저장/불러오기 (JSON)
  const exportCurrentProject = () => {
    if (!currentProjectId) {
      alert('내보낼 프로젝트가 없습니다.');
      return;
    }

    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;

    const data = {
      projectName: project.name,
      createdAt: project.createdAt,
      updatedAt: new Date().toISOString(),
      currentWeek: activeWeek,
      observations,
      patterns,
      categories,
      aiPatterns,
      analysisComplete,
      ideas,
      selectedIdeaId,
      validationData,
      mvpPlan,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        const newProject = {
          id: Date.now().toString(),
          name: data.projectName || '가져온 프로젝트',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          currentWeek: data.currentWeek || 1,
          data: {
            observations: data.observations || [],
            patterns: data.patterns || [],
            categories: data.categories || ['직장 업무', '개인 시간 관리', '소비 패턴'],
            aiPatterns: data.aiPatterns || [],
            analysisComplete: data.analysisComplete || false,
            ideas: data.ideas || [],
            selectedIdeaId: data.selectedIdeaId || null,
            validationData: data.validationData || {},
            mvpPlan: data.mvpPlan || null
          }
        };

        setProjects(prev => [...prev, newProject]);
        setCurrentProjectId(newProject.id);
        loadProjectData(newProject);
        await saveProjectToDB(newProject);
        
        alert('프로젝트를 성공적으로 가져왔습니다!');
      } catch (err) {
        alert('파일을 불러오는데 실패했습니다.');
      }
    };
    reader.readAsText(file);
  };

  const weekProgress = {
    1: { target: 10, current: observations.length },
    2: { target: 3, current: patterns.length },
    3: { target: 5, current: selectedIdeaId && validationData[selectedIdeaId] ? validationData[selectedIdeaId].interviews.length : 0 },
    4: { target: 1, current: mvpPlan ? 1 : 0 },
    5: { target: projects.length, current: projects.length }
  };

  // 가이드 컴포넌트들
  const Week1Guide = () => (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <BookOpen className="text-blue-600 mt-1" size={20} />
        <div className="flex-1">
          <h3 className="font-bold text-blue-900 mb-2">가이드: 불편함 수집</h3>
          <p className="text-sm text-blue-800 mb-3">
            <strong>목표:</strong> 10개 중 6개 이상 모으기 (하루 2개 × 5일)
          </p>
          
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <p className="font-semibold mb-1">📱 알림 설정하기:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>평일 점심 12:30 - "오전 불편 1개"</li>
                <li>평일 저녁 21:00 - "오후 불편 1개"</li>
              </ul>
            </div>
            
            <div>
              <p className="font-semibold mb-1">✍️ 기록 예시:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>"엑셀 시트 찾느라 10분 날림"</li>
                <li>"또 같은 메뉴 고민함"</li>
                <li>"운동복 챙기기 귀찮아서 안 감"</li>
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-300 rounded p-2 mt-2">
              <p className="text-xs font-semibold text-green-800">
                ✅ 성공 기준: 매일 안 해도 됨! 주말에 몰아서 해도 OK!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Week2Guide = () => (
    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-5 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <Target className="text-purple-600 mt-1" size={20} />
        <div className="flex-1">
          <h3 className="font-bold text-purple-900 mb-2">가이드: 패턴 찾기</h3>
          <p className="text-sm text-purple-800 mb-3">
            <strong>목표:</strong> 이전 단계의 기록에서 반복되는 것 Top 3 찾기
          </p>
          
          <div className="space-y-3 text-sm text-purple-800">
            <div>
              <p className="font-semibold mb-1">🔍 패턴 예시:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>"찾기"</strong> 관련: 파일, 링크, 메모, 맛집 정보</li>
                <li><strong>"선택"</strong> 관련: 메뉴, 옷, 콘텐츠</li>
                <li><strong>"시작"</strong> 관련: 운동, 공부, 정리</li>
                <li><strong>"확인"</strong> 관련: 일정, 금액, 날씨</li>
              </ul>
            </div>
            
            <div className="bg-white rounded p-3">
              <p className="font-semibold mb-2">📊 분석 방법 (주말 30분):</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>이전 기록 쭉 읽기</li>
                <li>"이거 비슷한데?" 싶은 것들 묶기</li>
                <li>빈도 높은 순서로 정렬</li>
                <li>Top 3 선정</li>
              </ol>
            </div>
            
            <div className="bg-purple-100 border border-purple-300 rounded p-2 mt-2">
              <p className="text-xs font-semibold text-purple-900">
                💡 Tip: "같은 불편함"보다는 "같은 종류의 문제"로 묶어보세요!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Week3Guide = () => (
    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <MessageCircle className="text-green-600 mt-1" size={20} />
        <div className="flex-1">
          <h3 className="font-bold text-green-900 mb-2">가이드: 아이디어 검증</h3>
          <p className="text-sm text-green-800 mb-3">
            <strong>목표:</strong> 선정한 아이디어를 실제로 검증하기
          </p>
          
          <div className="space-y-4 text-sm text-green-800">
            <div className="bg-white rounded p-3">
              <p className="font-semibold mb-2">💬 대화로 검증 (5명)</p>
              <div className="text-xs bg-green-50 p-2 rounded mb-2">
                <p className="font-semibold mb-1">핵심 3질문:</p>
                <p className="mb-1">1. 얼마나 자주 겪나요?</p>
                <p className="mb-1">2. 해결되면 얼마나 도움될까요? (10점)</p>
                <p>3. 돈 낼 의향이 있나요?</p>
              </div>
            </div>

            <div className="bg-white rounded p-3">
              <p className="font-semibold mb-2">🔎 온라인 검증</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                <li>검색 리서치: 관련 검색어, 트렌드 분석</li>
                <li>경쟁/유사 서비스 분석</li>
                <li>커뮤니티 분석: 사람들의 반응</li>
                <li>기존 플레이어 painpoint 파악</li>
              </ul>
            </div>

            <div className="bg-green-100 border border-green-400 rounded p-3 mt-2">
              <p className="font-semibold mb-2 text-xs">✅ 기회 신호 체크리스트:</p>
              <ul className="text-xs space-y-1">
                <li>□ 나 포함 3명 이상이 겪는 문제인가?</li>
                <li>□ 한 달에 3번 이상 발생하는가?</li>
                <li>□ 기존 해결책이 만족스럽지 않은가?</li>
                <li>□ 내가 직접 써보고 싶은가?</li>
                <li className="mt-2 font-semibold">→ 4개 중 3개 이상 YES면 Go!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Week4Guide = () => (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-5 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <Rocket className="text-amber-600 mt-1" size={20} />
        <div className="flex-1">
          <h3 className="font-bold text-amber-900 mb-2">가이드: MVP 테스트</h3>
          <p className="text-sm text-amber-800 mb-3">
            <strong>목표:</strong> 검증 데이터를 바탕으로 실행 가능한 MVP 테스트 플랜 수립
          </p>
          
          <div className="space-y-3 text-sm text-amber-800">
            <div className="bg-white rounded p-3">
              <p className="font-semibold mb-2">🎯 AI가 제안하는 내용:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                <li>서비스명 예시 3가지</li>
                <li>핵심 소구점 (1-2문장)</li>
                <li>추천 전달 방식</li>
                <li>구체적 테스트 방법</li>
                <li>측정 지표 및 성공 기준</li>
              </ul>
            </div>
            
            <div className="bg-amber-100 border border-amber-400 rounded p-2">
              <p className="text-xs font-semibold text-amber-900">
                💡 Tip: AI 제안을 참고해서 실제로 실행해보세요. 수정도 가능합니다!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const selectedIdea = selectedIdeaId ? ideas.find(idea => idea.id === selectedIdeaId) : null;
  const currentValidation = selectedIdeaId ? validationData[selectedIdeaId] : null;
  const currentProject = currentProjectId ? projects.find(p => p.id === currentProjectId) : null;

  if (isLoadingProjects) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 md:p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6 relative">
          {/* Settings button - fixed top right on mobile */}
          <button
            onClick={() => setShowSettings(true)}
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition"
            title="설정"
          >
            <Settings size={18} />
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pr-14 md:pr-0">
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <img src="/logo.svg" alt="ProtoCheck" className="w-8 h-8 md:w-10 md:h-10" />
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                  ProtoCheck
                </h1>
              </div>
              <p className="text-sm md:text-base text-slate-600">나만의 사업 아이디어 검증 도구</p>
              {currentProject && (
                <p className="text-xs md:text-sm text-amber-600 mt-1 font-semibold">
                  📁 {currentProject.name}
                </p>
              )}
              <p className="text-xs md:text-sm text-blue-600 mt-1">
                📊 카테고리: <strong>{categories.join(', ')}</strong>
              </p>
              {selectedIdea && (
                <p className="text-xs md:text-sm text-green-600 mt-1">
                  💡 선정된 아이디어: <strong>{selectedIdea.name}</strong>
                </p>
              )}
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm md:text-base ${
                  showGuide ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                <BookOpen size={18} />
                {showGuide ? '가이드 숨기기' : '가이드 보기'}
              </button>
            </div>
          </div>

          {/* Week Tabs - Mobile Responsive */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {[
              { week: 5, label: '내 프로젝트', shortLabel: '프로젝트', icon: '📁' },
              { week: 1, label: '불편함 수집', shortLabel: '불편함' },
              { week: 2, label: '패턴 분석', shortLabel: '패턴' },
              { week: 3, label: '아이디어 검증', shortLabel: '검증' },
              { week: 4, label: 'MVP 테스트(AI)', shortLabel: 'MVP' }
            ].map(({ week, label, shortLabel, icon }) => (
              <button
                key={week}
                onClick={() => setActiveWeek(week)}
                className={`py-3 px-2 md:px-4 rounded-lg font-medium transition text-sm md:text-base ${
                  activeWeek === week
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {icon && <span className="mr-1">{icon}</span>}
                <span className="hidden md:inline">{label}</span>
                <span className="md:hidden">{shortLabel}</span>
              </button>
            ))}
          </div>

          {/* Progress */}
          {activeWeek !== 5 && (
            <div className="mt-4 bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">
                  진행도
                </span>
                <span className="text-sm text-slate-600">
                  {weekProgress[activeWeek].current} / {weekProgress[activeWeek].target}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (weekProgress[activeWeek].current / weekProgress[activeWeek].target) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 1단계: 불편함 수집 */}
        {activeWeek === 1 && (
          <div>
            {showGuide && <Week1Guide />}

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="text-blue-500" size={24} />
                <h2 className="text-xl font-bold text-slate-800">불편함 기록</h2>
              </div>
              <p className="text-slate-600 mb-4">
                목표: 10개 중 6개 이상 수집 (하루 2개 × 5일)
              </p>

            {/* Input */}
            <div className="space-y-3 mb-6">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setShowQuickCategoryModal(true);
                  } else {
                    setSelectedCategory(e.target.value);
                  }
                }}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">카테고리 선택...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__add_new__">+ 새 카테고리 추가</option>
              </select>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newObs}
                  onChange={(e) => setNewObs(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addObservation()}
                  placeholder="오늘 불편했던 것을 한 줄로..."
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addObservation}
                  className="px-4 md:px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                >
                  <Plus size={20} />
                  <span className="hidden md:inline">추가</span>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {observations.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  아직 기록이 없습니다. 첫 불편함을 기록해보세요!
                </div>
              ) : (
                observations.map(obs => (
                  <div
                    key={obs.id}
                    className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                  >
                    <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                          {obs.category}
                        </span>
                        <span className="text-xs text-slate-500">{obs.date}</span>
                      </div>
                      <p className="text-slate-800">{obs.text}</p>
                    </div>
                    <button
                      onClick={() => deleteObservation(obs.id)}
                      className="text-slate-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>
        )}

        {/* 2단계: 패턴 분석 */}
        {activeWeek === 2 && (
          <div>
            {showGuide && <Week2Guide />}
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-blue-500" size={24} />
                <h2 className="text-xl font-bold text-slate-800">패턴 찾기</h2>
              </div>
              <p className="text-slate-600 mb-4">
                카테고리별로 반복되는 패턴 Top 3를 찾아보세요
              </p>

              {/* 카테고리 선택 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  분석할 카테고리 선택
                </label>
                <select
                  value={selectedAnalysisCategory}
                  onChange={(e) => setSelectedAnalysisCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="전체">전체</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat} ({observations.filter(obs => obs.category === cat).length}개)
                    </option>
                  ))}
                </select>
              </div>

              {/* AI 분석 버튼 */}
              <div className="mb-6">
                <button
                  onClick={analyzeWithAI}
                  disabled={(selectedAnalysisCategory === '전체' ? observations.length : observations.filter(obs => obs.category === selectedAnalysisCategory).length) < 3 || isAnalyzing || !canUseAI()}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    (selectedAnalysisCategory === '전체' ? observations.length : observations.filter(obs => obs.category === selectedAnalysisCategory).length) < 3 || isAnalyzing || !canUseAI()
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <TrendingUp size={20} />
                      {selectedAnalysisCategory === '전체' ? '전체' : selectedAnalysisCategory} 카테고리 패턴 분석하기
                    </>
                  )}
                </button>
                <div className="mt-2 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    getRemainingAIUsage() > 0 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    오늘 남은 AI 분석: {getRemainingAIUsage()}/{AI_DAILY_LIMIT}회
                  </span>
                </div>
                {(selectedAnalysisCategory === '전체' ? observations.length : observations.filter(obs => obs.category === selectedAnalysisCategory).length) < 3 && (
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    최소 3개 이상의 불편함이 필요합니다 (현재: {selectedAnalysisCategory === '전체' ? observations.length : observations.filter(obs => obs.category === selectedAnalysisCategory).length}개)
                  </p>
                )}
              </div>

              {/* 분석 진척 현황판 */}
              {(isAnalyzing || analysisComplete) && (
                <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isAnalyzing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                      분석 현황 - {selectedAnalysisCategory}
                    </h3>
                    <span className="text-sm font-semibold text-blue-600">
                      {isAnalyzing ? '진행 중' : '완료'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">수집된 불편함</span>
                      <span className="font-semibold text-slate-800">
                        {selectedAnalysisCategory === '전체' ? observations.length : observations.filter(obs => obs.category === selectedAnalysisCategory).length}개
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">분석된 패턴</span>
                      <span className="font-semibold text-slate-800">{aiPatterns.length}개</span>
                    </div>
                    {analysisComplete && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-green-700 font-semibold">
                          ✅ AI 분석이 완료되었습니다! 아래에서 패턴을 확인하세요.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI 분석 결과 */}
              {aiPatterns.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    AI 분석 결과 - {aiPatterns[0]?.category || '전체'} TOP 3 패턴
                  </h3>
                  <div className="space-y-4">
                    {aiPatterns.map((pattern, idx) => (
                      <div key={pattern.id} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-slate-800 mb-1">{pattern.name}</div>
                            <div className="text-xs text-purple-600 font-semibold mb-2">
                              반복 횟수: {pattern.count}회
                            </div>
                            <p className="text-sm text-slate-700 mb-3">{pattern.observations}</p>
                            {pattern.relatedItems && pattern.relatedItems.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-purple-200">
                                <p className="text-xs font-semibold text-slate-600 mb-1">관련된 불편함:</p>
                                <ul className="text-xs text-slate-600 space-y-1">
                                  {pattern.relatedItems.map((item, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span className="text-purple-500">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 전체 수집 내용 */}
              {observations.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-500" />
                    {selectedAnalysisCategory === '전체' ? '전체' : selectedAnalysisCategory} 수집된 불편함 
                    ({(selectedAnalysisCategory === '전체' ? observations : observations.filter(obs => obs.category === selectedAnalysisCategory)).length}개)
                  </h3>
                  <div className="max-h-64 overflow-y-auto space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    {(selectedAnalysisCategory === '전체' ? observations : observations.filter(obs => obs.category === selectedAnalysisCategory)).map(obs => (
                      <div key={obs.id} className="flex items-start gap-2 p-2 bg-white rounded border border-slate-200">
                        <CheckCircle className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                        <div className="flex-1 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                              {obs.category}
                            </span>
                            <span className="text-xs text-slate-500">{obs.date}</span>
                          </div>
                          <p className="text-slate-800">{obs.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 수동 패턴 추가 */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Plus size={18} className="text-slate-600" />
                  수동으로 패턴 추가하기
                </h3>

            <button
              onClick={addPattern}
              className="mb-6 px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition flex items-center gap-2"
            >
              <Plus size={18} />
              패턴 추가
            </button>

            <div className="space-y-4">
              {patterns.filter(p => !aiPatterns.find(ap => ap.id === p.id)).length === 0 && aiPatterns.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  "불편함 데이터 기반 패턴 분석하기"를 클릭하거나<br/>
                  수동으로 패턴을 추가해보세요
                </div>
              ) : (
                patterns.filter(p => !aiPatterns.find(ap => ap.id === p.id)).map((pattern, idx) => (
                  <div key={pattern.id} className="p-4 border-2 border-slate-200 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 bg-slate-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {aiPatterns.length + idx + 1}
                      </div>
                      <input
                        type="text"
                        value={pattern.name}
                        onChange={(e) => updatePattern(pattern.id, 'name', e.target.value)}
                        placeholder="패턴 이름 (예: 파일 찾기)"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={pattern.count}
                        onChange={(e) => updatePattern(pattern.id, 'count', e.target.value)}
                        placeholder="빈도"
                        className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => deletePattern(pattern.id)}
                        className="text-slate-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <textarea
                      value={pattern.observations}
                      onChange={(e) => updatePattern(pattern.id, 'observations', e.target.value)}
                      placeholder="관련된 관찰 내용을 여기에..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      rows={2}
                    />
                  </div>
                ))
              )}
            </div>
            </div>
            </div>
          </div>
        )}

        {/* 3단계: 아이디어 검증 */}
        {activeWeek === 3 && (
          <div>
            {showGuide && <Week3Guide />}
            
            {/* 발견된 패턴 표시 */}
            {patterns.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-purple-600" size={24} />
                  <h2 className="text-xl font-bold text-purple-900">발견된 패턴</h2>
                </div>
                <p className="text-sm text-purple-700 mb-4">
                  아래 패턴들을 참고해서 아이디어를 선정해보세요!
                </p>
                
                <div className="space-y-3">
                  {patterns.map((pattern, idx) => (
                    <div key={pattern.id} className="p-4 bg-white rounded-lg border-2 border-purple-100 hover:border-purple-300 transition">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-800 mb-1">{pattern.name}</div>
                          {pattern.count > 0 && (
                            <div className="text-xs text-purple-600 font-semibold mb-2">
                              반복 횟수: {pattern.count}회
                            </div>
                          )}
                          <p className="text-sm text-slate-600">{pattern.observations}</p>
                          {pattern.category && (
                            <div className="mt-2">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                                {pattern.category}
                              </span>
                            </div>
                          )}
                          {pattern.relatedItems && pattern.relatedItems.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-purple-100">
                              <p className="text-xs font-semibold text-slate-600 mb-1">관련된 불편함:</p>
                              <ul className="text-xs text-slate-600 space-y-1">
                                {pattern.relatedItems.map((item, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <span className="text-purple-500">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                  <p className="text-xs text-purple-800">
                    <strong>💡 Tip:</strong> 각 패턴을 해결하는 서비스/제품을 아이디어로 만들어보세요. 
                    예: "파일 찾기 어려움" → "AI 기반 파일 검색 도구"
                  </p>
                </div>
              </div>
            )}

            {patterns.length === 0 && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-amber-600" size={20} />
                  <h3 className="font-bold text-amber-900">패턴을 먼저 찾아보세요</h3>
                </div>
                <p className="text-sm text-amber-800">
                  패턴 분석 단계를 완료하면 여기에 자동으로 표시됩니다.
                  패턴을 바탕으로 아이디어를 선정하는 것이 더 효과적입니다!
                </p>
              </div>
            )}
            
            {/* 아이디어 선정 */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="text-amber-500" size={24} />
                  <h2 className="text-xl font-bold text-slate-800">아이디어 선정</h2>
                </div>
                <button
                  onClick={() => {
                    setNewIdea({ name: '', description: '' });
                    setEditingIdeaId(null);
                    setShowIdeaModal(true);
                  }}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition flex items-center gap-2"
                >
                  <Plus size={18} />
                  아이디어 추가
                </button>
              </div>

              {/* 아이디어 모달 */}
              {showIdeaModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">
                      {editingIdeaId ? '아이디어 수정' : '새 아이디어 추가'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 왼쪽: 입력 폼 */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            아이디어 이름
                          </label>
                          <input
                            type="text"
                            value={newIdea.name}
                            onChange={(e) => setNewIdea({ ...newIdea, name: e.target.value })}
                            placeholder="예: 파일 찾기 도우미"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            간략한 설명
                          </label>
                          <textarea
                            value={newIdea.description}
                            onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                            placeholder="이 아이디어가 해결하려는 문제와 해결 방법을 간략히 설명하세요..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            rows={8}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setShowIdeaModal(false);
                              setNewIdea({ name: '', description: '' });
                              setEditingIdeaId(null);
                            }}
                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                          >
                            취소
                          </button>
                          <button
                            onClick={saveIdea}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                          >
                            저장
                          </button>
                        </div>
                      </div>

                      {/* 오른쪽: 패턴 참고 */}
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="text-purple-600" size={18} />
                          <h4 className="font-bold text-purple-900 text-sm">참고: 발견된 패턴</h4>
                        </div>
                        
                        {patterns.length === 0 ? (
                          <p className="text-xs text-purple-700">
                            패턴 분석 단계를 먼저 완료해보세요!
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {patterns.map((pattern, idx) => (
                              <div key={pattern.id} className="p-3 bg-white rounded-lg border border-purple-100 text-xs">
                                <div className="flex items-start gap-2 mb-1">
                                  <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-bold text-slate-800">{pattern.name}</div>
                                    {pattern.count > 0 && (
                                      <div className="text-purple-600 font-semibold">
                                        {pattern.count}회 반복
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <p className="text-slate-600 ml-7">{pattern.observations}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 p-2 bg-purple-100 rounded text-xs text-purple-800">
                          <strong>💡 작성 팁:</strong>
                          <ul className="mt-1 space-y-1 ml-3">
                            <li>• 어떤 패턴을 해결할 건가요?</li>
                            <li>• 어떻게 해결할 건가요?</li>
                            <li>• 기존 방법과 뭐가 다른가요?</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 아이디어 리스트 */}
              {ideas.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  아직 아이디어가 없습니다. "아이디어 추가" 버튼을 눌러 시작하세요!
                </div>
              ) : (
                <div className="space-y-3">
                  {ideas.map(idea => (
                    <div key={idea.id} className="p-4 border-2 border-slate-200 rounded-lg hover:border-amber-300 transition">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="selectedIdea"
                          checked={selectedIdeaId === idea.id}
                          onChange={() => setSelectedIdeaId(idea.id)}
                          className="mt-1 w-5 h-5 text-amber-500"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-slate-800 mb-1">{idea.name}</div>
                          <p className="text-sm text-slate-600 mb-2">{idea.description}</p>
                          <div className="text-xs text-slate-500">생성일: {idea.createdAt}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editIdea(idea)}
                            className="text-blue-500 hover:text-blue-700 transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteIdea(idea.id)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {selectedIdeaId && (
                    <button
                      onClick={applySelectedIdea}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition font-semibold"
                    >
                      선택한 아이디어 적용
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 선정된 아이디어 표시 */}
            {selectedIdea && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="text-amber-600" size={20} />
                  <h3 className="font-bold text-amber-900">검증 중인 아이디어</h3>
                </div>
                <div className="font-bold text-lg text-slate-800 mb-1">{selectedIdea.name}</div>
                <p className="text-sm text-slate-600">{selectedIdea.description}</p>
              </div>
            )}

            {selectedIdea && currentValidation && (
              <div className="space-y-6">
                {/* 대화로 검증 (5명) */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="text-blue-500" size={24} />
                    <h2 className="text-xl font-bold text-slate-800">대화로 검증 (5명)</h2>
                  </div>

                  <button
                    onClick={addInterview}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                  >
                    <Plus size={18} />
                    인터뷰 추가
                  </button>

                  <div className="space-y-4">
                    {currentValidation.interviews.map(interview => (
                      <div key={interview.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <input
                            type="text"
                            value={interview.name}
                            onChange={(e) => updateInterview(interview.id, 'name', e.target.value)}
                            placeholder="인터뷰 대상 이름"
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <select
                            value={interview.category}
                            onChange={(e) => updateInterview(interview.id, 'category', e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="">카테고리 선택</option>
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="space-y-3">
                          {/* 질문 1 */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              1. 얼마나 자주 이 불편함을 겪나요?
                            </label>
                            <select
                              value={interview.frequency}
                              onChange={(e) => updateInterview(interview.id, 'frequency', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="">선택...</option>
                              <option value="주 3회 이상">주 3회 이상</option>
                              <option value="주 1-2회">주 1-2회</option>
                              <option value="월 1-2회">월 1-2회</option>
                              <option value="거의 없음">거의 없음</option>
                            </select>
                          </div>

                          {/* 질문 2 */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              2. 문제 해결 시 얼마나 도움될까요? ({interview.helpScore}/10)
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={interview.helpScore}
                              onChange={(e) => updateInterview(interview.id, 'helpScore', parseInt(e.target.value))}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                              <span>전혀 도움 안됨</span>
                              <span>매우 큰 도움</span>
                            </div>
                          </div>

                          {/* 질문 3 */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              3. 지불 의향이 있나요?
                            </label>
                            <select
                              value={interview.payment}
                              onChange={(e) => updateInterview(interview.id, 'payment', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="">선택...</option>
                              <option value="월 5천원까지">월 5천원까지</option>
                              <option value="월 1만원까지">월 1만원까지</option>
                              <option value="월 3만원까지">월 3만원까지</option>
                              <option value="무료만">무료만</option>
                              <option value="안 씀">안 씀</option>
                            </select>
                          </div>

                          {/* 메모 */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              📝 한 줄 메모
                            </label>
                            <textarea
                              value={interview.memo}
                              onChange={(e) => updateInterview(interview.id, 'memo', e.target.value)}
                              placeholder="인터뷰 중 중요한 발견이나 특이사항..."
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              rows={2}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => deleteInterview(interview.id)}
                          className="mt-3 text-xs text-red-500 hover:text-red-700 transition"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 온라인 검증 섹션들 */}
                {[
                  { key: 'searchResearch', title: '온라인 검증 (검색 리서치)', icon: Search },
                  { key: 'competitors', title: '온라인 검증 (경쟁/유사 서비스 분석)', icon: TrendingUp },
                  { key: 'community', title: '온라인 검증 (커뮤니티 분석)', icon: Users },
                  { key: 'painpoints', title: '온라인 검증 (기존 플레이어 painpoint)', icon: Target }
                ].map(({ key, title, icon: Icon }) => (
                  <div key={key} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Icon className="text-green-500" size={24} />
                      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                    </div>

                    <div className="space-y-4">
                      <textarea
                        value={currentValidation.onlineValidation[key].text}
                        onChange={(e) => updateOnlineValidation(key, 'text', e.target.value)}
                        placeholder="자유롭게 내용을 작성하세요..."
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={6}
                      />

                      {/* 이미지 첨부 */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <Image size={16} className="inline mr-1" />
                          이미지 첨부
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && addImage(key, e.target.files[0])}
                          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        />
                        
                        {currentValidation.onlineValidation[key].images?.length > 0 && (
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {currentValidation.onlineValidation[key].images.map((img, idx) => (
                              <div key={idx} className="relative group">
                                <img src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                                <button
                                  onClick={() => removeImage(key, idx)}
                                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 영상 URL */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <Video size={16} className="inline mr-1" />
                          영상 URL 추가
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="https://youtube.com/..."
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.target.value) {
                                addVideo(key, e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.target.previousSibling;
                              if (input.value) {
                                addVideo(key, input.value);
                                input.value = '';
                              }
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                          >
                            추가
                          </button>
                        </div>
                        
                        {currentValidation.onlineValidation[key].videos?.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {currentValidation.onlineValidation[key].videos.map((url, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                <Video size={16} className="text-green-500" />
                                <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-blue-600 hover:underline truncate">
                                  {url}
                                </a>
                                <button
                                  onClick={() => removeVideo(key, idx)}
                                  className="text-red-500 hover:text-red-700 transition"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!selectedIdea && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Lightbulb className="mx-auto text-slate-300 mb-4" size={64} />
                <p className="text-slate-500 text-lg mb-4">
                  먼저 아이디어를 선정해주세요
                </p>
                <button
                  onClick={() => {
                    setNewIdea({ name: '', description: '' });
                    setEditingIdeaId(null);
                    setShowIdeaModal(true);
                  }}
                  className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                >
                  아이디어 추가하기
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4단계: MVP 테스트 추천(AI) */}
        {activeWeek === 4 && (
          <div>
            {showGuide && <Week4Guide />}
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="text-amber-500" size={24} />
                <h2 className="text-xl font-bold text-slate-800">MVP 테스트 추천</h2>
              </div>

              {!selectedIdea ? (
                <div className="text-center py-12">
                  <Lightbulb className="mx-auto text-slate-300 mb-4" size={64} />
                  <p className="text-slate-500">
                    먼저 아이디어 검증 단계에서 아이디어를 선정하고 검증 데이터를 입력해주세요.
                  </p>
                </div>
              ) : !currentValidation || currentValidation.interviews.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto text-slate-300 mb-4" size={64} />
                  <p className="text-slate-500">
                    아이디어 검증 단계에서 최소 1개 이상의 인터뷰 데이터를 입력해주세요.
                  </p>
                </div>
              ) : (
                <div>
                  {/* AI 생성 버튼 */}
                  {!mvpPlan && (
                    <div className="mb-6">
                      <button
                        onClick={generateMVPPlan}
                        disabled={isGeneratingMVP || !canUseAI()}
                        className={`w-full py-4 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                          isGeneratingMVP || !canUseAI()
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                        }`}
                      >
                        {isGeneratingMVP ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            AI가 MVP 플랜을 생성하는 중...
                          </>
                        ) : (
                          <>
                            <Rocket size={20} />
                            MVP 테스트 플랜 생성하기
                          </>
                        )}
                      </button>
                      <div className="mt-2 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          getRemainingAIUsage() > 0 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          오늘 남은 AI 분석: {getRemainingAIUsage()}/{AI_DAILY_LIMIT}회
                        </span>
                      </div>
                    </div>
                  )}

                  {/* MVP 플랜 표시 및 수정 */}
                  {mvpPlan && (
                    <div className="space-y-6">
                      {/* 서비스명 */}
                      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg">
                        <label className="block text-sm font-semibold text-amber-900 mb-3">
                          🎯 서비스명 예시
                        </label>
                        <div className="space-y-2">
                          {mvpPlan.serviceNames.map((name, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-sm font-medium text-amber-700">{idx + 1}.</span>
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                  const newNames = [...mvpPlan.serviceNames];
                                  newNames[idx] = e.target.value;
                                  updateMVPPlan('serviceNames', newNames);
                                }}
                                className="flex-1 px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 핵심 소구점 */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          💬 핵심 소구점
                        </label>
                        <textarea
                          value={mvpPlan.coreMessage}
                          onChange={(e) => updateMVPPlan('coreMessage', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          rows={3}
                        />
                      </div>

                      {/* 전달 방식 */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          📢 추천 전달 방식
                        </label>
                        <input
                          type="text"
                          value={mvpPlan.deliveryMethod}
                          onChange={(e) => updateMVPPlan('deliveryMethod', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* 테스트 플랜 */}
                      <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                        <h3 className="font-bold text-slate-800 mb-4">🧪 구체적 테스트 플랜</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              테스트 방법
                            </label>
                            <textarea
                              value={mvpPlan.testPlan.method}
                              onChange={(e) => updateMVPTestPlan('method', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              rows={3}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              채널 (쉼표로 구분)
                            </label>
                            <input
                              type="text"
                              value={mvpPlan.testPlan.channels.join(', ')}
                              onChange={(e) => updateMVPTestPlan('channels', e.target.value.split(',').map(s => s.trim()))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              측정 지표 (쉼표로 구분)
                            </label>
                            <input
                              type="text"
                              value={mvpPlan.testPlan.metrics.join(', ')}
                              onChange={(e) => updateMVPTestPlan('metrics', e.target.value.split(',').map(s => s.trim()))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              성공 기준
                            </label>
                            <input
                              type="text"
                              value={mvpPlan.testPlan.successCriteria}
                              onChange={(e) => updateMVPTestPlan('successCriteria', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 일정 및 예산 */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            ⏰ 추천 일정
                          </label>
                          <input
                            type="text"
                            value={mvpPlan.timeline}
                            onChange={(e) => updateMVPPlan('timeline', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            💰 예상 비용
                          </label>
                          <input
                            type="text"
                            value={mvpPlan.budget}
                            onChange={(e) => updateMVPPlan('budget', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      {/* 재생성 버튼 */}
                      <button
                        onClick={() => {
                          setMvpPlan(null);
                        }}
                        className="w-full py-3 px-6 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium"
                      >
                        다시 생성하기
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5단계: 내 프로젝트 */}
        {activeWeek === 5 && (
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="text-blue-500" size={24} />
                  <h2 className="text-xl font-bold text-slate-800">내 프로젝트 ({projects.length}개)</h2>
                </div>
                <button
                  onClick={openNewProjectModal}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                >
                  <Plus size={18} />
                  새 프로젝트
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto text-slate-300 mb-4" size={64} />
                  <p className="text-slate-500 mb-4">프로젝트가 없습니다.</p>
                  <button
                    onClick={openNewProjectModal}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    첫 프로젝트 시작하기
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map(project => {
                    const isCurrent = project.id === currentProjectId;
                    const obsCount = project.data.observations?.length || 0;
                    const patternCount = project.data.patterns?.length || 0;
                    const ideaCount = project.data.ideas?.length || 0;
                    
                    return (
                      <div
                        key={project.id}
                        className={`p-5 rounded-xl border-2 transition ${
                          isCurrent
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex gap-2 mb-1">
                              <input
                                type="text"
                                value={editingProjectId === project.id ? tempProjectName : project.name}
                                onChange={(e) => editingProjectId === project.id && setTempProjectName(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && editingProjectId === project.id) {
                                    saveProjectName(project.id);
                                  }
                                }}
                                disabled={editingProjectId !== project.id}
                                className={`text-lg font-bold flex-1 px-2 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  editingProjectId === project.id
                                    ? isCurrent
                                      ? 'bg-white border-blue-300'
                                      : 'bg-white border-slate-300'
                                    : isCurrent
                                      ? 'bg-blue-50 border-blue-200 text-slate-700 cursor-not-allowed'
                                      : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                                }`}
                              />
                              {editingProjectId === project.id ? (
                                <>
                                  <button
                                    onClick={() => saveProjectName(project.id)}
                                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                    title="저장"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    onClick={cancelEditingProject}
                                    className="px-2 py-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition"
                                    title="취소"
                                  >
                                    ✕
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => startEditingProject(project.id, project.name)}
                                  className="px-2 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition"
                                  title="수정"
                                >
                                  <Edit2 size={16} />
                                </button>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 space-y-1">
                              <div>생성: {new Date(project.createdAt).toLocaleDateString('ko-KR')}</div>
                              <div>수정: {new Date(project.updatedAt).toLocaleDateString('ko-KR')}</div>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                              현재
                            </span>
                          )}
                        </div>

                        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                          <div className="text-sm font-semibold text-slate-700 mb-2">
                            진행 상황: {project.currentWeek}단계
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="font-bold text-blue-600">{obsCount}</div>
                              <div className="text-slate-500">불편함</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-purple-600">{patternCount}</div>
                              <div className="text-slate-500">패턴</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-amber-600">{ideaCount}</div>
                              <div className="text-slate-500">아이디어</div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {!isCurrent && (
                            <button
                              onClick={() => switchProject(project.id)}
                              className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
                            >
                              열기
                            </button>
                          )}
                          {isCurrent && (
                            <button
                              disabled
                              className="px-3 py-2 bg-slate-200 text-slate-400 text-sm rounded-lg cursor-not-allowed"
                            >
                              작업 중
                            </button>
                          )}
                          <button
                            onClick={() => duplicateProject(project.id)}
                            className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition"
                          >
                            복사
                          </button>
                          <button
                            onClick={() => {
                              console.log('삭제 버튼 클릭됨, 프로젝트 ID:', project.id);
                              confirmDeleteProject(project.id);
                            }}
                            className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-2">💡 프로젝트 관리 팁</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>자동 저장:</strong> 모든 변경사항은 자동으로 저장됩니다</li>
                  <li>• <strong>여러 프로젝트:</strong> 동시에 여러 아이디어를 실험해보세요</li>
                  <li>• <strong>복사:</strong> 비슷한 아이디어는 기존 프로젝트를 복사해서 시작하세요</li>
                </ul>
              </div>
            </div>

            {/* 삭제 확인 모달 */}
            {projectToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Trash2 className="text-red-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">프로젝트 삭제</h3>
                      <p className="text-sm text-slate-600">
                        {projects.find(p => p.id === projectToDelete)?.name}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-slate-700 mb-6">
                    이 프로젝트를 삭제하시겠습니까?<br/>
                    <strong className="text-red-600">모든 데이터가 영구적으로 삭제됩니다.</strong>
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={cancelDelete}
                      className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-semibold"
                    >
                      취소
                    </button>
                    <button
                      onClick={deleteProject}
                      className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                    >
                      삭제하기
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 새 프로젝트 생성 모달 */}
            {showNewProjectModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Plus className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">새 프로젝트 만들기</h3>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      프로젝트 이름
                    </label>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                      placeholder="예: 직장인 시간관리 문제 탐색"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>

                  <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">💡</span>
                      <span>프로젝트를 생성하면, 자동으로 <strong>불편함 수집 단계</strong>로 이동됩니다.</span>
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={closeNewProjectModal}
                      className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-semibold"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleCreateProject}
                      className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                    >
                      만들기
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 빠른 카테고리 추가 모달 */}
            {showQuickCategoryModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-sm w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Plus className="text-green-600" size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">새 카테고리 추가</h3>
                  </div>
                  
                  <input
                    type="text"
                    value={quickCategoryName}
                    onChange={(e) => setQuickCategoryName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addQuickCategory()}
                    placeholder="예: 건강 관리, 취미 생활..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                    autoFocus
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowQuickCategoryModal(false);
                        setQuickCategoryName('');
                      }}
                      className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium"
                    >
                      취소
                    </button>
                    <button
                      onClick={addQuickCategory}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                    >
                      추가
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timeline Summary */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar size={20} />
            전체 타임라인
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border-2 ${activeWeek === 1 ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
              <div className="font-bold text-slate-800 mb-2">1단계: 수집</div>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• 불편함 기록</li>
                <li>• 목표: 10개 중 6개</li>
              </ul>
            </div>
            <div className={`p-4 rounded-lg border-2 ${activeWeek === 2 ? 'border-purple-500 bg-purple-50' : 'border-slate-200'}`}>
              <div className="font-bold text-slate-800 mb-2">2단계: 분석</div>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• 패턴 분석</li>
                <li>• AI 자동 분석</li>
              </ul>
            </div>
            <div className={`p-4 rounded-lg border-2 ${activeWeek === 3 ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
              <div className="font-bold text-slate-800 mb-2">3단계: 검증</div>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• 아이디어 선정</li>
                <li>• 5명 인터뷰</li>
                <li>• 온라인 검증</li>
              </ul>
            </div>
            <div className={`p-4 rounded-lg border-2 ${activeWeek === 4 ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}>
              <div className="font-bold text-slate-800 mb-2">4단계: MVP</div>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• AI 플랜 생성</li>
                <li>• 실행 준비</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-amber-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-700 text-center">
              <strong>완료 후:</strong> 검증된 아이디어 + MVP 테스트 플랜 + 실행 준비 완료
            </p>
          </div>
        </div>

        {/* 설정 슬라이드 패널 */}
        {showSettings && (
          <>
            {/* 오버레이 */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowSettings(false)}
            />
            
            {/* 설정 패널 */}
            <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
              <div className="p-6">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Settings size={24} className="text-slate-700" />
                    설정
                  </h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 프로필 섹션 */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600">👤</span>
                    </div>
                    프로필
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        이름
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={isEditingName ? tempUserName : userName}
                          onChange={(e) => isEditingName && setTempUserName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && isEditingName && saveUserName()}
                          placeholder="이름을 입력하세요"
                          disabled={!isEditingName}
                          className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isEditingName 
                              ? 'border-slate-300 bg-white' 
                              : 'border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed'
                          }`}
                        />
                        {isEditingName ? (
                          <>
                            <button
                              onClick={saveUserName}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-1"
                              title="저장"
                            >
                              <CheckCircle size={18} />
                            </button>
                            {userName && (
                              <button
                                onClick={cancelEditingName}
                                className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition"
                                title="취소"
                              >
                                ✕
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={startEditingName}
                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition flex items-center gap-1"
                            title="수정"
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <button
                        disabled
                        className="w-full px-4 py-3 bg-slate-200 text-slate-400 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <span>🔐</span>
                        Google로 로그인 (준비 중)
                      </button>
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        곧 로그인 기능이 추가됩니다!
                      </p>
                    </div>
                  </div>
                </div>

                {/* 카테고리 관리 */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600">📁</span>
                    </div>
                    카테고리 관리
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    {categories.map(cat => (
                      <div key={cat} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{cat}</span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                            {observations.filter(obs => obs.category === cat).length}개
                          </span>
                        </div>
                        <button
                          onClick={() => deleteCategory(cat)}
                          className="text-slate-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                      placeholder="새 카테고리..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <button
                      onClick={addCategory}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center gap-2"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* 데이터 관리 */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600">💾</span>
                    </div>
                    데이터 관리
                  </h3>

                  <div className="space-y-4">
                    {/* 스토리지 정보 */}
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">저장 공간 사용량</span>
                        <span className="text-sm font-bold text-slate-800">{calculateStorageSize()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">프로젝트 수</span>
                        <span className="text-sm font-bold text-slate-800">{projects.length}개</span>
                      </div>
                    </div>

                    {/* 자동 백업 */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-blue-900">자동 백업</span>
                          <span className="text-xs text-blue-600">(매일 1회)</span>
                        </div>
                        <button
                          onClick={toggleAutoBackup}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            autoBackup ? 'bg-blue-500' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              autoBackup ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-xs text-blue-700">
                        활성화 시 매일 자동으로 모든 프로젝트를 백업합니다
                      </p>
                    </div>

                    {/* 수동 백업 */}
                    <button
                      onClick={backupAllProjects}
                      className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      전체 백업 (지금 실행)
                    </button>

                    {/* 데이터 초기화 */}
                    <button
                      onClick={clearAllData}
                      className="w-full px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      모든 데이터 삭제
                    </button>
                  </div>
                </div>

                {/* 앱 정보 */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="text-center text-sm text-slate-500">
                    <p className="font-semibold mb-1">ProtoCheck</p>
                    <p>버전 1.0.0</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer Reminder */}
        <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 text-sm text-green-800">
          <strong>✅ 자동 저장 활성화:</strong> 모든 변경사항은 자동으로 브라우저에 저장됩니다.
        </div>
      </div>
    </div>
  );
}
