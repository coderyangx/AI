import { useCallback, useEffect, useState } from "react";

export function QueryPreview({ query_id }) {
  const [info, setInfo] = useState<any>(null);
  const getInfo = useCallback(async (id: string) => {
    try {
      const resp = await fetch(
        `${window.top.location.origin}/ai-agent/query/preview`,
        {
          headers: {},
          method: "POST",
          body: JSON.stringify({
            query_id: id,
          }),
        }
      );

      if (resp.ok) {
        const info = await resp.json();
        setInfo(info);
      }
    } catch (e) {
      console.log("e", e);
      // ignore
    }
  }, []);

  useEffect(() => {
    getInfo(query_id);
  }, [query_id]);

  if (!info) {
    return null;
  }

  return (
    <div className="text-xs mb-2">
      等价 SQL 执行提示:
      <div className="border rounded p-2 mt-1 bg-yellow-300">{info?.sql}</div>
    </div>
  );
}
