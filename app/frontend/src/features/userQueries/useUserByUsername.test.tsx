import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import { service } from "../../service";
import { getUser } from "../../test/serviceMockDefaults";
import useUserByUsername from "./useUserByUsername";

const getUserMock = service.user.getUser as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

beforeAll(() => {
  // Mock out console.error so the test output is less noisy when
  // an error is intentionally thrown for negative tests
  jest.spyOn(console, "error").mockReturnValue(undefined);
});

beforeEach(() => {
  getUserMock.mockImplementation(getUser);
});

describe("while loading", () => {
  it("returns loading with no errors", async () => {
    const { result } = renderHook(() => useUserByUsername("funnydog"), {
      wrapper,
    });

    expect(result.current).toEqual({
      isLoading: true,
      isFetching: true,
      isError: false,
      error: "",
      data: undefined,
    });
  });
});

describe("when user has loaded", () => {
  beforeEach(() => {
    //these tests get userId 2, the mock implementation only supports fetch by id
    getUserMock.mockResolvedValueOnce({ userId: 2, username: "funnydog" });
  });
  it("returns the user data with no errors", async () => {
    const { result, waitFor } = renderHook(
      () => useUserByUsername("funnydog"),
      {
        wrapper,
      }
    );
    await waitFor(() => !result.current.isLoading);

    expect(result.current).toEqual({
      isLoading: false,
      isFetching: false,
      isError: false,
      error: "",
      data: {
        name: "Funny Dog",
        userId: 2,
        username: "funnydog",
        avatarUrl: "funnydog.jpg",
      },
    });
    expect(getUserMock).toHaveBeenCalledTimes(2);
  });

  it("returns isError as true and the errors if some getUser queries failed", async () => {
    getUserMock.mockRejectedValue(new Error("Error fetching user funnydog"));

    const { result, waitForNextUpdate } = renderHook(
      () => useUserByUsername("funnydog"),
      {
        wrapper,
      }
    );
    await waitForNextUpdate();

    expect(result.current).toMatchObject({
      isLoading: false,
      isFetching: false,
      isError: true,
      error: "Error fetching user funnydog",
      data: undefined,
    });
  });
});

describe("cached data", () => {
  const sharedClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const sharedClientWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={sharedClient}>{children}</QueryClientProvider>
  );
  beforeEach(async () => {
    sharedClient.clear();
    sharedClient.setQueryData(["username2Id", "funnydog"], {
      username: "funnydog",
      userId: 2,
    });
    sharedClient.setQueryData(["user", 2], {
      name: "Funny Dog",
      userId: 2,
      username: "funnydog",
      avatarUrl: "funnydog.jpg",
    });
    await sharedClient.refetchQueries();
  });

  it("is used instead of refetching", async () => {
    const { result } = renderHook(() => useUserByUsername("funnydog"), {
      wrapper: sharedClientWrapper,
    });

    expect(getUserMock).not.toHaveBeenCalled();
    expect(result.current.isFetching).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("is invalidated when requested, userid2user map not invalidated", async () => {
    renderHook(() => useUserByUsername("funnydog", true), {
      wrapper: sharedClientWrapper,
    });

    expect(getUserMock).toBeCalledTimes(1);
  });

  it("is returned when stale if subsequent refetch queries fail", async () => {
    getUserMock.mockRejectedValue(new Error("Error fetching user data"));
    const { result, waitForNextUpdate } = renderHook(
      () => useUserByUsername("funnydog", true),
      {
        wrapper: sharedClientWrapper,
      }
    );
    await waitForNextUpdate();

    expect(result.current).toMatchObject({
      isLoading: false,
      isFetching: false,
      isError: true,
      error: "Error fetching user data",
      data: {
        name: "Funny Dog",
        userId: 2,
        username: "funnydog",
        avatarUrl: "funnydog.jpg",
      },
    });
  });
});
