import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const API_BASE = window.top.location.origin;

function Citation({ id }) {
  const [result, setResult] = useState(null);
  const getCitation = useCallback(async (id: string) => {
    try {
      const resp = await fetch(`${API_BASE}/ai-agent/chart-citation`, {
        headers: {},
        method: "POST",
        body: JSON.stringify({
          query_id: id,
        }),
      });

      if (resp.ok) {
        const info = await resp.json();
        setResult(info);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    getCitation(id);
  }, [id]);

  if (!result) {
    return null;
  }

  return (
    <div className="text-xs overflow-auto">
      <pre>
        <code>{JSON.stringify(result, null, 2)}</code>
      </pre>
    </div>
  );
}

export function EChartsCitationDirective({ ids }) {
  return (
    <div className="chart-citations flex flex-wrap gap-2 my-2">
      数据引用来源：
      {ids.map((id, index) => {
        return (
          <Dialog>
            <DialogTrigger>
              <div
                key={id}
                className="chart-citation text-blue-500 hover:underline"
              >
                {`引用 ${index + 1}`}
              </div>
            </DialogTrigger>
            <DialogContent className="max-h-screen">
              <DialogHeader className="overflow-hidden">
                <DialogTitle className="text-left">数据引用详情</DialogTitle>
                <DialogDescription className="text-left">
                  <Citation id={id} />
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}
