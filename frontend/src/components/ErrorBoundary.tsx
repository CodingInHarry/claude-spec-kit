import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div role="alert" className="m-6 rounded-md border border-red-300 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">문제가 발생했습니다.</p>
          <p className="text-sm">페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
