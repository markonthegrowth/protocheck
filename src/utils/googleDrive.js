import { getAccessToken } from './firebaseAuth';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3';
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

// 폴더 이름 상수
const ROOT_FOLDER_NAME = 'ProtoCheck';
const DELETED_FOLDER_NAME = '삭제된 프로젝트';

// ProtoCheck 루트 폴더 찾기 또는 생성
async function getOrCreateRootFolder(accessToken) {
    try {
        const query = `name='${ROOT_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const response = await fetch(
            `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!response.ok) throw new Error('Failed to search for root folder');
        const data = await response.json();
        
        if (data.files && data.files.length > 0) {
            console.log('✅ ProtoCheck 폴더 찾음:', data.files[0].id);
            return data.files[0].id;
        }

        const createResponse = await fetch(
            `${DRIVE_API_BASE}/files`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: ROOT_FOLDER_NAME,
                    mimeType: 'application/vnd.google-apps.folder'
                })
            }
        );

        if (!createResponse.ok) throw new Error('Failed to create root folder');
        const folder = await createResponse.json();
        console.log('✅ ProtoCheck 폴더 생성:', folder.id);
        return folder.id;
    } catch (error) {
        console.error('Root folder error:', error);
        throw error;
    }
}

// "삭제된 프로젝트" 폴더 찾기 또는 생성
async function getOrCreateDeletedFolder(accessToken, rootFolderId) {
    try {
        const query = `name='${DELETED_FOLDER_NAME}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const response = await fetch(
            `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!response.ok) throw new Error('Failed to search for deleted folder');
        const data = await response.json();
        
        if (data.files && data.files.length > 0) {
            return data.files[0].id;
        }

        const createResponse = await fetch(
            `${DRIVE_API_BASE}/files`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: DELETED_FOLDER_NAME,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [rootFolderId]
                })
            }
        );

        if (!createResponse.ok) throw new Error('Failed to create deleted folder');
        const folder = await createResponse.json();
        console.log('✅ 삭제된 프로젝트 폴더 생성');
        return folder.id;
    } catch (error) {
        console.error('Deleted folder error:', error);
        throw error;
    }
}

// 프로젝트 폴더 찾기 또는 생성
async function getOrCreateProjectFolder(accessToken, rootFolderId, projectName) {
    try {
        const query = `name='${projectName}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const response = await fetch(
            `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!response.ok) throw new Error('Failed to search for project folder');
        const data = await response.json();
        
        if (data.files && data.files.length > 0) {
            console.log(`✅ "${projectName}" 폴더 찾음`);
            return data.files[0].id;
        }

        const createResponse = await fetch(
            `${DRIVE_API_BASE}/files`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: projectName,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [rootFolderId]
                })
            }
        );

        if (!createResponse.ok) throw new Error('Failed to create project folder');
        const folder = await createResponse.json();
        console.log(`✅ "${projectName}" 폴더 생성:`, folder.id);
        return folder.id;
    } catch (error) {
        console.error('Project folder error:', error);
        throw error;
    }
}

// 프로젝트 폴더 이름 변경
async function renameProjectFolder(accessToken, folderId, newName) {
    try {
        const response = await fetch(
            `${DRIVE_API_BASE}/files/${folderId}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newName })
            }
        );

        if (!response.ok) throw new Error('Failed to rename folder');
        console.log(`✅ 폴더 이름 변경: "${newName}"`);
        return await response.json();
    } catch (error) {
        console.error('Rename folder error:', error);
        throw error;
    }
}

// JSON 파일 생성 또는 업데이트
async function saveJsonFile(accessToken, projectFolderId, project) {
    const fileName = `${project.name}_data.json`;
    
    try {
        const query = `name contains '_data.json' and '${projectFolderId}' in parents and trashed=false`;
        const response = await fetch(
            `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!response.ok) throw new Error('Failed to search for JSON file');
        const data = await response.json();
        const fileContent = JSON.stringify(project, null, 2);
        
        if (data.files && data.files.length > 0) {
            const fileId = data.files[0].id;
            
            // 파일 이름 변경
            await fetch(
                `${DRIVE_API_BASE}/files/${fileId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: fileName })
                }
            );
            
            // 내용 업데이트
            const updateResponse = await fetch(
                `${UPLOAD_API_BASE}/files/${fileId}?uploadType=media`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: fileContent
                }
            );

            if (!updateResponse.ok) throw new Error('Failed to update JSON file');
            console.log(`✅ JSON 파일 업데이트: ${fileName}`);
            return await updateResponse.json();
        } else {
            // 새 파일 생성
            const metadata = {
                name: fileName,
                mimeType: 'application/json',
                parents: [projectFolderId]
            };

            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                fileContent +
                close_delim;

            const createResponse = await fetch(
                `${UPLOAD_API_BASE}/files?uploadType=multipart`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': `multipart/related; boundary=${boundary}`
                    },
                    body: multipartRequestBody
                }
            );

            if (!createResponse.ok) throw new Error('Failed to create JSON file');
            console.log(`✅ JSON 파일 생성: ${fileName}`);
            return await createResponse.json();
        }
    } catch (error) {
        console.error('Save JSON error:', error);
        throw error;
    }
}

// Google Sheets에 데이터 작성
async function writeToSheet(accessToken, spreadsheetId, project) {
    try {
        // 시트 데이터 구성
        const requests = [];
        
        // 1. 기존 시트 클리어
        requests.push({
            updateCells: {
                range: {
                    sheetId: 0
                },
                fields: '*'
            }
        });

        // 2. 시트 제목 설정
        const sheetTitle = `${project.name} 분석`;
        requests.push({
            updateSheetProperties: {
                properties: {
                    sheetId: 0,
                    title: sheetTitle
                },
                fields: 'title'
            }
        });

        // 시트 클리어 및 제목 설정
        await fetch(
            `${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ requests })
            }
        );

        // 3. 데이터 작성
        const values = [];
        
        // 헤더
        values.push(['ProtoCheck 프로젝트 분석']);
        values.push(['프로젝트명', project.name]);
        values.push(['생성일', new Date(project.createdAt).toLocaleDateString('ko-KR')]);
        values.push(['마지막 수정', new Date(project.updatedAt).toLocaleDateString('ko-KR')]);
        values.push([]);
        
        // 관찰 데이터
        if (project.observations && project.observations.length > 0) {
            values.push(['=== 관찰 기록 ===']);
            values.push(['날짜', '카테고리', '관찰 내용']);
            
            project.observations.forEach(obs => {
                values.push([
                    new Date(obs.date).toLocaleDateString('ko-KR'),
                    obs.category || '미분류',
                    obs.text
                ]);
            });
            values.push([]);
        }
        
        // 패턴 분석
        if (project.patterns && project.patterns.length > 0) {
            values.push(['=== 발견된 패턴 ===']);
            values.push(['카테고리', '패턴', '빈도']);
            
            project.patterns.forEach(pattern => {
                values.push([
                    pattern.category || '전체',
                    pattern.text,
                    pattern.count || 1
                ]);
            });
            values.push([]);
        }
        
        // AI 패턴 분석
        if (project.aiPatterns && project.aiPatterns.length > 0) {
            values.push(['=== AI 패턴 분석 ===']);
            values.push(['카테고리', '패턴 설명', '불편함', '기회']);
            
            project.aiPatterns.forEach(pattern => {
                values.push([
                    pattern.category || '전체',
                    pattern.pattern || '',
                    pattern.pain || '',
                    pattern.opportunity || ''
                ]);
            });
            values.push([]);
        }
        
        // 아이디어
        if (project.ideas && project.ideas.length > 0) {
            values.push(['=== 아이디어 ===']);
            values.push(['아이디어명', '설명', '생성일']);
            
            project.ideas.forEach(idea => {
                values.push([
                    idea.name,
                    idea.description || '',
                    new Date(idea.createdAt).toLocaleDateString('ko-KR')
                ]);
            });
            values.push([]);
        }
        
        // MVP 계획
        if (project.mvpPlan) {
            values.push(['=== MVP 계획 ===']);
            values.push(['구분', '내용']);
            values.push(['핵심 기능', project.mvpPlan.coreFeature || '']);
            values.push(['타겟 사용자', project.mvpPlan.targetUser || '']);
            values.push(['예상 개발 기간', project.mvpPlan.timeline || '']);
            values.push(['필요 리소스', project.mvpPlan.resources || '']);
        }

        // 데이터 업데이트
        await fetch(
            `${SHEETS_API_BASE}/${spreadsheetId}/values/A1:Z1000?valueInputOption=USER_ENTERED`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: values
                })
            }
        );

        // 포맷팅 적용
        const formatRequests = [
            // 헤더 행 스타일
            {
                repeatCell: {
                    range: {
                        sheetId: 0,
                        startRowIndex: 0,
                        endRowIndex: 1
                    },
                    cell: {
                        userEnteredFormat: {
                            backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                            textFormat: {
                                foregroundColor: { red: 1, green: 1, blue: 1 },
                                fontSize: 14,
                                bold: true
                            }
                        }
                    },
                    fields: 'userEnteredFormat(backgroundColor,textFormat)'
                }
            },
            // 열 너비 자동 조정
            {
                autoResizeDimensions: {
                    dimensions: {
                        sheetId: 0,
                        dimension: 'COLUMNS',
                        startIndex: 0,
                        endIndex: 10
                    }
                }
            }
        ];

        await fetch(
            `${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ requests: formatRequests })
            }
        );

        console.log('✅ Google Sheets 데이터 작성 완료');
    } catch (error) {
        console.error('Write to sheet error:', error);
        throw error;
    }
}

// Google Sheets 생성 또는 업데이트
async function saveAsSheet(accessToken, projectFolderId, project) {
    const sheetName = `${project.name}_분석`;
    
    try {
        const query = `'${projectFolderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
        const response = await fetch(
            `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!response.ok) throw new Error('Failed to search for sheet');
        const data = await response.json();
        
        let sheetId;
        
        if (data.files && data.files.length > 0) {
            sheetId = data.files[0].id;
            
            // 시트 이름 변경
            await fetch(
                `${DRIVE_API_BASE}/files/${sheetId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: sheetName })
                }
            );
            
            console.log(`✅ 스프레드시트 찾음: ${sheetName}`);
        } else {
            // 새 시트 생성
            const createResponse = await fetch(
                `${DRIVE_API_BASE}/files`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: sheetName,
                        mimeType: 'application/vnd.google-apps.spreadsheet',
                        parents: [projectFolderId]
                    })
                }
            );

            if (!createResponse.ok) throw new Error('Failed to create sheet');
            const newSheet = await createResponse.json();
            sheetId = newSheet.id;
            console.log(`✅ 스프레드시트 생성: ${sheetName}`);
        }
        
        // 시트에 데이터 작성
        await writeToSheet(accessToken, sheetId, project);
        
        return { id: sheetId, name: sheetName };
    } catch (error) {
        console.error('Save sheet error:', error);
        throw error;
    }
}

// 프로젝트 목록 가져오기
export async function listProjects() {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('Not logged in');

    try {
        const rootFolderId = await getOrCreateRootFolder(accessToken);
        
        const query = `'${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false and not name='${DELETED_FOLDER_NAME}'`;
        const response = await fetch(
            `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!response.ok) throw new Error('Failed to list projects');
        const data = await response.json();
        return data.files || [];
    } catch (error) {
        console.error('List projects error:', error);
        throw error;
    }
}

// 프로젝트 불러오기
export async function loadProject(folderId) {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('Not logged in');

    try {
        const query = `'${folderId}' in parents and name contains '_data.json' and trashed=false`;
        const response = await fetch(
            `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!response.ok) throw new Error('Failed to search for project file');
        const data = await response.json();
        
        if (!data.files || data.files.length === 0) {
            return null;
        }

        const fileId = data.files[0].id;
        const contentResponse = await fetch(
            `${DRIVE_API_BASE}/files/${fileId}?alt=media`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!contentResponse.ok) throw new Error('Failed to load project content');
        return await contentResponse.json();
    } catch (error) {
        console.error('Load project error:', error);
        throw error;
    }
}

// 프로젝트 저장
export async function saveProject(project) {
    console.log('💾 프로젝트 저장 시작:', project.name);
    
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('Not logged in');

    try {
        const rootFolderId = await getOrCreateRootFolder(accessToken);
        console.log('📁 ProtoCheck 폴더 ID:', rootFolderId);
        
        const projectFolderId = await getOrCreateProjectFolder(accessToken, rootFolderId, project.name);
        console.log('📁 프로젝트 폴더 ID:', projectFolderId);
        
        // JSON 파일 저장
        await saveJsonFile(accessToken, projectFolderId, project);
        
        // Google Sheets 생성 및 데이터 작성
        const sheetInfo = await saveAsSheet(accessToken, projectFolderId, project);
        console.log('📊 Google Sheets:', sheetInfo);
        
        console.log('🎉 프로젝트 저장 완료!');
        
        return { 
            success: true, 
            folderId: projectFolderId,
            sheetId: sheetInfo.id,
            message: 'Saved to Drive' 
        };
    } catch (error) {
        console.error('Save project error:', error);
        throw error;
    }
}

// 프로젝트 이름 변경
export async function renameProject(folderId, newName) {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('Not logged in');

    try {
        await renameProjectFolder(accessToken, folderId, newName);
        return { success: true };
    } catch (error) {
        console.error('Rename project error:', error);
        throw error;
    }
}

// 프로젝트 삭제
export async function deleteProject(folderId) {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('Not logged in');

    try {
        const rootFolderId = await getOrCreateRootFolder(accessToken);
        const deletedFolderId = await getOrCreateDeletedFolder(accessToken, rootFolderId);
        
        const response = await fetch(
            `${DRIVE_API_BASE}/files/${folderId}?addParents=${deletedFolderId}&removeParents=${rootFolderId}`,
            {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );

        if (!response.ok) throw new Error('Failed to move folder');
        console.log('✅ 삭제된 프로젝트 폴더로 이동');
        return true;
    } catch (error) {
        console.error('Delete project error:', error);
        throw error;
    }
}

// 모든 프로젝트 백업
export async function backupAllProjects() {
    try {
        const folders = await listProjects();
        const projects = [];

        for (const folder of folders) {
            const project = await loadProject(folder.id);
            if (project) {
                projects.push(project);
            }
        }

        const backupData = {
            version: '1.0',
            backupDate: new Date().toISOString(),
            projects
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `protocheck_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        return true;
    } catch (error) {
        console.error('Backup error:', error);
        throw error;
    }
}
