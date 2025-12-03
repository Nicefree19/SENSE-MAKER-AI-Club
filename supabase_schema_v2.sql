-- ============================================
-- SENSE MAKER AI Club Database Schema V2
-- 추가 기능을 위한 테이블 및 정책
-- ============================================

-- ============================================
-- 1. contact_messages 테이블 (문의 메시지)
-- ============================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  replied_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert contact messages." ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view contact messages." ON public.contact_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can update contact messages." ON public.contact_messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 2. comments 테이블 (댓글)
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  content text NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone,
  CONSTRAINT comment_target CHECK (
    (post_id IS NOT NULL AND project_id IS NULL) OR
    (post_id IS NULL AND project_id IS NOT NULL)
  )
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone." ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments." ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own comments." ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments." ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- ============================================
-- 3. likes 테이블 (좋아요)
-- ============================================
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT like_target CHECK (
    (post_id IS NOT NULL AND project_id IS NULL) OR
    (post_id IS NULL AND project_id IS NOT NULL)
  ),
  CONSTRAINT unique_post_like UNIQUE (user_id, post_id),
  CONSTRAINT unique_project_like UNIQUE (user_id, project_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are viewable by everyone." ON public.likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create likes." ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes." ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. bookmarks 테이블 (북마크)
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT bookmark_target CHECK (
    (post_id IS NOT NULL AND project_id IS NULL) OR
    (post_id IS NULL AND project_id IS NOT NULL)
  ),
  CONSTRAINT unique_post_bookmark UNIQUE (user_id, post_id),
  CONSTRAINT unique_project_bookmark UNIQUE (user_id, project_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookmarks." ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create bookmarks." ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks." ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. notifications 테이블 (알림)
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('comment', 'like', 'reply', 'project_update', 'mention')),
  title text NOT NULL,
  message text,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications." ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications." ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications." ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications." ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 6. project_members 테이블 (프로젝트 팀원)
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_project_member UNIQUE (project_id, user_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project members are viewable by everyone." ON public.project_members FOR SELECT USING (true);
CREATE POLICY "Project owners can manage members." ON public.project_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND author_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.project_members WHERE project_id = project_members.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
);
CREATE POLICY "Project owners can update members." ON public.project_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND author_id = auth.uid())
);
CREATE POLICY "Project owners can remove members." ON public.project_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND author_id = auth.uid())
  OR user_id = auth.uid()
);

-- ============================================
-- 7. activity_logs 테이블 (활동 기록)
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL CHECK (action IN ('create_project', 'update_project', 'delete_project', 'create_post', 'update_post', 'delete_post', 'publish_post', 'comment', 'like', 'join_project')),
  target_type text CHECK (target_type IN ('project', 'post', 'comment')),
  target_id uuid,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activity logs are viewable by everyone." ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "System can create activity logs." ON public.activity_logs FOR INSERT WITH CHECK (true);

-- ============================================
-- 8. 기존 테이블에 컬럼 추가
-- ============================================

-- profiles 테이블에 bio 추가
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin text;

-- posts 테이블에 view_count 추가
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;

-- projects 테이블에 view_count 추가
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS github_url text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS demo_url text;

-- ============================================
-- 9. 조회수 증가 함수
-- ============================================
CREATE OR REPLACE FUNCTION increment_view_count(table_name text, row_id uuid)
RETURNS void AS $$
BEGIN
  IF table_name = 'posts' THEN
    UPDATE public.posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = row_id;
  ELSIF table_name = 'projects' THEN
    UPDATE public.projects SET view_count = COALESCE(view_count, 0) + 1 WHERE id = row_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. 좋아요 카운트 함수
-- ============================================
CREATE OR REPLACE FUNCTION get_like_count(target_type text, target_id uuid)
RETURNS integer AS $$
DECLARE
  count_result integer;
BEGIN
  IF target_type = 'post' THEN
    SELECT COUNT(*) INTO count_result FROM public.likes WHERE post_id = target_id;
  ELSIF target_type = 'project' THEN
    SELECT COUNT(*) INTO count_result FROM public.likes WHERE project_id = target_id;
  ELSE
    count_result := 0;
  END IF;
  RETURN count_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 11. 댓글 카운트 함수
-- ============================================
CREATE OR REPLACE FUNCTION get_comment_count(target_type text, target_id uuid)
RETURNS integer AS $$
DECLARE
  count_result integer;
BEGIN
  IF target_type = 'post' THEN
    SELECT COUNT(*) INTO count_result FROM public.comments WHERE post_id = target_id;
  ELSIF target_type = 'project' THEN
    SELECT COUNT(*) INTO count_result FROM public.comments WHERE project_id = target_id;
  ELSE
    count_result := 0;
  END IF;
  RETURN count_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 12. user_settings 테이블 (사용자 설정)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme text DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  email_notifications boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own settings." ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings." ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings." ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
