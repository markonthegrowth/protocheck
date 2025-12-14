import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Trash2, CheckCircle, Edit2, Settings, LogOut, Rocket, Search } from 'lucide-react';
import { logout as firebaseLogout, getSavedUserInfo, isLoggedIn } from './utils/firebaseAuth';
import { listProjects as listDriveProjects, loadProject as loadDriveProject, saveProject as saveDriveProject, deleteProject as deleteDriveProject } from './utils/googleDrive';
// saveDriveProject 추가됨!

export default function ProjectListPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [tempProjectName, setTempProjectName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 로그인 확인
  useEffect(() => {
    if (!isLoggedIn()) {
      console.log('❌ 로그인 안 됨, /login으로 이동');
      navigate('/login', { replace: true });
      return;
    }

    const savedUser = getSavedUserInfo();
    if (savedUser) {
      setUser(savedUser);
      loadProjects();
    }
  }, [navigate]);

  // 프로젝트 목록 로딩
  const loadProjects = async () => {
    try {
      console.log('📂 프로젝트 목록 로딩 중...');
      const folders = await listDriveProjects();
      const loadedProjects = [];

      for (const folder of folders) {
        try {
          const project = await loadDriveProject(folder.id);
          if (project) {
            project.driveFileId = folder.id;
            loadedProjects.push(project);
          }
        } catch (err) {
          console.error('프로젝트 로딩 실패:', folder.name, err);
        }
      }

      setProjects(loadedProjects);
      console.log(`✅ ${loadedProjects.length}개 프로젝트 로드됨`);
    } catch (error) {
      console.error('❌ 프로젝트 목록 로딩 실패:', error);
      alert('프로젝트 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 프로젝트 열기
  const openProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  // 새 프로젝트 생성
  const createNewProject = async () => {
    if (!newProjectName.trim()) {
      alert('프로젝트 이름을 입력해주세요.');
      return;
    }

    const newProject = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
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

    try {
      // Google Drive에 저장
      console.log('💾 새 프로젝트 저장 중...');
      const result = await saveDriveProject(newProject);

      if (result && result.folderId) {
        newProject.driveFileId = result.folderId;
        console.log('✅ 프로젝트 저장 완료:', result.folderId);
      }

      setProjects([...projects, newProject]);
      setShowNewProjectModal(false);
      setNewProjectName('');

      // 저장 완료 후 프로젝트로 이동
      console.log('✅ 프로젝트로 이동:', newProject.id);
      openProject(newProject.id);
    } catch (error) {
      console.error('❌ 프로젝트 생성 실패:', error);
      alert('프로젝트 생성에 실패했습니다: ' + error.message);
    }
  };

  // 프로젝트 삭제
  const confirmDelete = (projectId) => {
    setProjectToDelete(projectId);
  };

  const executeDelete = async () => {
    if (!projectToDelete) return;

    const project = projects.find(p => p.id === projectToDelete);
    if (!project) return;

    try {
      if (project.driveFileId) {
        await deleteDriveProject(project.driveFileId);
      }

      setProjects(projects.filter(p => p.id !== projectToDelete));
      setProjectToDelete(null);
      console.log('✅ 프로젝트 삭제 완료');
    } catch (error) {
      console.error('❌ 프로젝트 삭제 실패:', error);
      alert('프로젝트 삭제에 실패했습니다.');
    }
  };

  // 프로젝트 이름 수정
  const startEditing = (projectId, currentName) => {
    setEditingProjectId(projectId);
    setTempProjectName(currentName);
  };

  const saveProjectName = (projectId) => {
    if (!tempProjectName.trim()) {
      alert('프로젝트 이름을 입력해주세요.');
      return;
    }

    setProjects(projects.map(p =>
      p.id === projectId
        ? { ...p, name: tempProjectName.trim(), updatedAt: new Date().toISOString() }
        : p
    ));
    setEditingProjectId(null);
    setTempProjectName('');
  };

  const cancelEditing = () => {
    setEditingProjectId(null);
    setTempProjectName('');
  };

  // 로그아웃
  const handleLogout = async () => {
    if (!confirm('로그아웃하시겠습니까?')) return;

    try {
      await firebaseLogout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      alert('로그아웃에 실패했습니다.');
    }
  };

  // 검색 필터링
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-slate-800">ProtoCheck</h1>
              <p className="text-xs text-slate-500">내 프로젝트</p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                {user.picture && (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                )}
                <div className="text-sm">
                  <div className="font-semibold text-slate-800">{user.name}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition flex items-center gap-2"
              >
                <LogOut size={18} />
                <span className="hidden md:inline">로그아웃</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                내 프로젝트
              </h2>
              <p className="text-slate-600">
                총 <span className="font-bold text-blue-600">{projects.length}개</span>의 프로젝트
              </p>
            </div>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              새 프로젝트
            </button>
          </div>

          {/* Search Bar */}
          {projects.length > 0 && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="프로젝트 검색..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Project Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Calendar className="mx-auto text-slate-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {searchQuery ? '검색 결과가 없습니다' : '프로젝트가 없습니다'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchQuery
                ? '다른 검색어로 시도해보세요.'
                : '첫 프로젝트를 만들고 아이디어 검증을 시작하세요!'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-semibold"
              >
                첫 프로젝트 시작하기
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => {
              const obsCount = project.data.observations?.length || 0;
              const patternCount = project.data.patterns?.length || 0;
              const ideaCount = project.data.ideas?.length || 0;

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-slate-200 hover:border-blue-300"
                >
                  <div className="p-6">
                    {/* Project Name */}
                    <div className="mb-4">
                      {editingProjectId === project.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tempProjectName}
                            onChange={(e) => setTempProjectName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && saveProjectName(project.id)}
                            className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => saveProjectName(project.id)}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-bold text-slate-800 flex-1 pr-2">
                            {project.name}
                          </h3>
                          <button
                            onClick={() => startEditing(project.id, project.name)}
                            className="p-2 text-slate-400 hover:text-slate-600 transition"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      )}
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(project.updatedAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600">진행 단계</span>
                        <span className="font-bold text-blue-600">{project.currentWeek}/4</span>
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

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openProject(project.id)}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                      >
                        열기
                      </button>
                      <button
                        onClick={() => confirmDelete(project.id)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        {projects.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Rocket size={20} className="text-blue-600" />
              💡 프로젝트 관리 팁
            </h3>
            <ul className="text-sm text-slate-700 space-y-2">
              <li>• <strong>자동 저장:</strong> 모든 변경사항은 Google Drive에 자동으로 저장됩니다</li>
              <li>• <strong>여러 프로젝트:</strong> 동시에 여러 아이디어를 실험해보세요</li>
              <li>• <strong>4단계 프로세스:</strong> 불편함 수집 → 패턴 분석 → 아이디어 검증 → MVP 테스트</li>
            </ul>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
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
              이 프로젝트를 삭제하시겠습니까?<br />
              <strong className="text-red-600">모든 데이터가 영구적으로 삭제됩니다.</strong>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition font-semibold"
              >
                취소
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-semibold"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">새 프로젝트 만들기</h3>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                프로젝트 이름
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createNewProject()}
                placeholder="예: 직장인 시간관리 문제 탐색"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewProjectModal(false);
                  setNewProjectName('');
                }}
                className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition font-semibold"
              >
                취소
              </button>
              <button
                onClick={createNewProject}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-semibold"
              >
                만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
