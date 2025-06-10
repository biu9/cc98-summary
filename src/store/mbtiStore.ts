import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { IUser } from "@cc98/api";
import { GET, POST } from "@/request";
import { IGeneralResponse, IMBTIRequest, IMBTIResponse } from "@request/api";
import { API_ROOT, MAX_CALL_PER_USER } from "../../config";
import { getTopicContent } from "@/utils/getTopicContent";
import { increaseCurrentCount, getCurrentCount } from "@/utils/limitation";

interface MBTIState {
  // 状态
  mbti: IMBTIResponse | undefined;
  loading: boolean;
  profile: IUser | undefined;

  // 操作方法
  setMBTI: (mbti: IMBTIResponse | undefined) => void;
  setLoading: (loading: boolean) => void;
  setProfile: (profile: IUser | undefined) => void;

  // 业务逻辑
  fetchProfile: (refreshToken: string) => Promise<void>;
  handleMBTITest: (
    refreshToken: string,
    setFeedback: (msg: string) => void
  ) => Promise<void>;
  reset: () => void;
}

// MBTI测试业务逻辑
const handleMBTI = async (
  text: string,
  username: string
): Promise<IGeneralResponse> => {
  const res = await POST<IMBTIRequest, IGeneralResponse>("/api/mbti", {
    text,
    username,
  });
  return res;
};

export const useMBTIStore = create<MBTIState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      mbti: undefined,
      loading: false,
      profile: undefined,

      // 基础操作
      setMBTI: (mbti) => set({ mbti }),
      setLoading: (loading) => set({ loading }),
      setProfile: (profile) => set({ profile }),

      // 获取用户资料
      fetchProfile: async (refreshToken: string) => {
        try {
          const profile = await GET<IUser>(
            `${API_ROOT}/me?sf_request_type=fetch`,
            refreshToken
          );
          set({ profile });
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        }
      },

      // 处理MBTI测试
      handleMBTITest: async (
        refreshToken: string,
        setFeedback: (msg: string) => void
      ) => {
        const { profile } = get();

        if (getCurrentCount() >= MAX_CALL_PER_USER) {
          setFeedback("今日测试次数已用完,请明日再试");
          return;
        }

        set({ loading: true });

        try {
          if (!refreshToken) {
            setFeedback("refresh_token is not defined");
            return;
          }

          const topicContent = await getTopicContent(refreshToken);
          const res = await handleMBTI(
            `topic: ${topicContent}`,
            profile?.name || ""
          );

          if (res.isOk) {
            set({ mbti: res.data });
            increaseCurrentCount();
          } else {
            setFeedback(res.msg);
          }
        } catch (error) {
          setFeedback("测试过程中发生错误，请重试");
          console.error("MBTI test error:", error);
        } finally {
          set({ loading: false });
        }
      },

      // 重置状态
      reset: () =>
        set({
          mbti: undefined,
          loading: false,
          profile: undefined,
        }),
    }),
    {
      name: "mbti-store",
    }
  )
);
