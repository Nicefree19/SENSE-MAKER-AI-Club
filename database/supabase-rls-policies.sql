-- ============================================
-- SENSE MAKER - Supabase RLS (Row Level Security) Policies
-- ============================================
-- 이 파일은 Supabase 데이터베이스 보안 정책을 정의합니다.
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- ============================================

-- ============================================
-- 1. PROFILES 테이블
-- ============================================

-- 모든 사용자 공개 프로필 조회 허용
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- 본인 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 회원가입 시 자동 프로필 생성 (auth.users 트리거에서 처리)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. PROJECTS 테이블
-- ============================================

-- 모든 프로젝트 공개 조회
CREATE POLICY "Projects are viewable by everyone"
ON projects FOR SELECT
USING (true);

-- 인증된 사용자만 프로젝트 생성 가능
CREATE POLICY "Authenticated users can create projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

-- 프로젝트 작성자만 수정 가능
CREATE POLICY "Project authors can update their projects"
ON projects FOR UPDATE
USING (auth.uid() = author_id);

-- 프로젝트 작성자만 삭제 가능
CREATE POLICY "Project authors can delete their projects"
ON projects FOR DELETE
USING (auth.uid() = author_id);

-- ============================================
-- 3. PROJECT_MEMBERS 테이블
-- ============================================

-- 프로젝트 멤버 목록은 모두 조회 가능
CREATE POLICY "Project members are viewable by everyone"
ON project_members FOR SELECT
USING (true);

-- 프로젝트 작성자만 멤버 추가 가능
CREATE POLICY "Project authors can add members"
ON project_members FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_id
        AND projects.author_id = auth.uid()
    )
);

-- 프로젝트 작성자만 멤버 역할 수정 가능
CREATE POLICY "Project authors can update member roles"
ON project_members FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_id
        AND projects.author_id = auth.uid()
    )
);

-- 프로젝트 작성자만 멤버 삭제 가능
CREATE POLICY "Project authors can remove members"
ON project_members FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_id
        AND projects.author_id = auth.uid()
    )
);

-- ============================================
-- 4. POSTS 테이블
-- ============================================

-- 발행된 게시물만 공개 조회
CREATE POLICY "Published posts are viewable by everyone"
ON posts FOR SELECT
USING (published = true OR auth.uid() = author_id);

-- 인증된 사용자만 게시물 생성 가능
CREATE POLICY "Authenticated users can create posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

-- 게시물 작성자만 수정 가능
CREATE POLICY "Post authors can update their posts"
ON posts FOR UPDATE
USING (auth.uid() = author_id);

-- 게시물 작성자만 삭제 가능
CREATE POLICY "Post authors can delete their posts"
ON posts FOR DELETE
USING (auth.uid() = author_id);

-- ============================================
-- 5. COMMENTS 테이블
-- ============================================

-- 모든 댓글 공개 조회
CREATE POLICY "Comments are viewable by everyone"
ON comments FOR SELECT
USING (true);

-- 인증된 사용자만 댓글 작성 가능
CREATE POLICY "Authenticated users can create comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

-- 댓글 작성자만 수정 가능
CREATE POLICY "Comment authors can update their comments"
ON comments FOR UPDATE
USING (auth.uid() = author_id);

-- 댓글 작성자만 삭제 가능
CREATE POLICY "Comment authors can delete their comments"
ON comments FOR DELETE
USING (auth.uid() = author_id);

-- ============================================
-- 6. LIKES 테이블
-- ============================================

-- 좋아요 정보는 모두 조회 가능
CREATE POLICY "Likes are viewable by everyone"
ON likes FOR SELECT
USING (true);

-- 인증된 사용자만 좋아요 가능
CREATE POLICY "Authenticated users can like"
ON likes FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 본인 좋아요만 취소 가능
CREATE POLICY "Users can delete their own likes"
ON likes FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 7. BOOKMARKS 테이블
-- ============================================

-- 본인 북마크만 조회 가능
CREATE POLICY "Users can view own bookmarks"
ON bookmarks FOR SELECT
USING (auth.uid() = user_id);

-- 인증된 사용자만 북마크 추가 가능
CREATE POLICY "Authenticated users can bookmark"
ON bookmarks FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 본인 북마크만 삭제 가능
CREATE POLICY "Users can delete their own bookmarks"
ON bookmarks FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 8. NOTIFICATIONS 테이블
-- ============================================

-- 본인 알림만 조회 가능
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- 시스템 또는 트리거에서만 알림 생성 (서비스 역할 사용)
-- 일반 사용자는 INSERT 불가

-- 본인 알림만 수정 가능 (읽음 처리)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- 본인 알림만 삭제 가능
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 9. CONTACT_MESSAGES 테이블
-- ============================================

-- 누구나 메시지 전송 가능 (공개 폼)
CREATE POLICY "Anyone can send contact messages"
ON contact_messages FOR INSERT
WITH CHECK (true);

-- 관리자만 메시지 조회 가능 (프로필에 is_admin 필드 필요)
CREATE POLICY "Only admins can view contact messages"
ON contact_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

-- 관리자만 읽음 처리 가능
CREATE POLICY "Only admins can update contact messages"
ON contact_messages FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

-- ============================================
-- 10. ACTIVITY_LOGS 테이블
-- ============================================

-- 관리자만 활동 로그 조회 가능
CREATE POLICY "Only admins can view activity logs"
ON activity_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

-- 인증된 사용자 활동 자동 기록 (트리거 또는 API에서 처리)
CREATE POLICY "Authenticated users log their activities"
ON activity_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ============================================
-- 11. USER_SETTINGS 테이블
-- ============================================

-- 본인 설정만 조회 가능
CREATE POLICY "Users can view own settings"
ON user_settings FOR SELECT
USING (auth.uid() = user_id);

-- 본인 설정만 생성/수정 가능
CREATE POLICY "Users can upsert own settings"
ON user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
ON user_settings FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- 12. STORAGE BUCKETS
-- ============================================

-- images 버킷 정책
-- 공개 조회 허용
CREATE POLICY "Public image access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images'
    AND auth.uid() IS NOT NULL
);

-- 본인 이미지만 삭제 가능
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 유틸리티 함수: 조회수 증가
-- ============================================

CREATE OR REPLACE FUNCTION increment_view_count(table_name TEXT, row_id UUID)
RETURNS VOID AS $$
BEGIN
    IF table_name = 'projects' THEN
        UPDATE projects SET view_count = COALESCE(view_count, 0) + 1 WHERE id = row_id;
    ELSIF table_name = 'posts' THEN
        UPDATE posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = row_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 자동 프로필 생성 트리거
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            'https://ui-avatars.com/api/?name=' ||
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) ||
            '&background=random'
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 테이블 RLS 활성화
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
