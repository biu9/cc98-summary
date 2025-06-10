import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { IUser } from "@cc98/api";
import { GET } from "@/request";
import { API_ROOT } from "../../config";

// 反馈状态接口
interface FeedbackState {
  feedback: string;
  setFeedback: (feedback: string) => void;
  clearFeedback: () => void;
}

// 用户信息状态接口
interface UserInfoState {
  userInfo: IUser | null;
  loading: boolean;
  error: string | null;
  fetchUserInfo: (accessToken: string) => Promise<void>;
  clearUserInfo: () => void;
  refetch: (accessToken?: string) => void;
}

// 合并的全局状态接口
interface GlobalState extends FeedbackState, UserInfoState {}

// 创建全局状态store
export const useGlobalStore = create<GlobalState>()(
  devtools(
    (set, get) => ({
      // 反馈状态
      feedback: "",
      setFeedback: (feedback: string) => set({ feedback }),
      clearFeedback: () => set({ feedback: "" }),

      // 用户信息状态
      userInfo: null,
      loading: false,
      error: null,

      fetchUserInfo: async (accessToken: string) => {
        const { loading } = get();

        // 防止重复请求
        if (loading) return;

        set({ loading: true, error: null });

        try {
          console.log("Fetching user info from global store...");
          const userData = await GET<IUser>(
            `${API_ROOT}/me?sf_request_type=fetch`,
            accessToken
          );
          set({ userInfo: userData, loading: false });
        } catch (error) {
          console.error("Failed to fetch user info:", error);
          set({
            error: "获取用户信息失败，请重试",
            userInfo: null,
            loading: false,
          });
        }
      },

      clearUserInfo: () =>
        set({
          userInfo: null,
          error: null,
          loading: false,
        }),

      refetch: (accessToken?: string) => {
        if (accessToken) {
          get().fetchUserInfo(accessToken);
        }
      },
    }),
    {
      name: "global-store",
    }
  )
);

// 反馈状态的单独hook（向后兼容）
export const useFeedback = () => {
  const { feedback, setFeedback, clearFeedback } = useGlobalStore();
  return { feedback, setFeedback, clearFeedback };
};

// 用户信息状态的单独hook（向后兼容）
export const useUserInfo = () => {
  const { userInfo, loading, error, fetchUserInfo, clearUserInfo, refetch } =
    useGlobalStore();

  return {
    userInfo,
    loading,
    error,
    fetchUserInfo,
    clearUserInfo,
    refetch,
  };
};
