import { ToolCacheManager } from "../../../lib/cache/tool.js";

const cacheManager = new ToolCacheManager({
  ttl: 1000 * 60 * 10,
});

// demo from https://km.it.st.sankuai.com/xtable/2702229971?table=2702595827
// 暂时用 st 环境+个人 cookie 模拟

const KM_API_BASE = "https://km.it.st.sankuai.com";

const headers = {
  Cookie:
    process.env.KM_COOKIE ||
    "_lxsdk_cuid=194ef04533cc8-09e33faf33fce5-1f525636-1d73c0-194ef04533cc8; _lxsdk=194ef04533cc8-09e33faf33fce5-1f525636-1d73c0-194ef04533cc8; s_u_745896=iHgYGvxcNQKucPnsK6ID6Q==; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%22194f3e8f315135a-0b95bcb772f8c4-1d525636-1930176-194f3e8f316333e%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMTk0ZjNlOGYzMTUxMzVhLTBiOTViY2I3NzJmOGM0LTFkNTI1NjM2LTE5MzAxNzYtMTk0ZjNlOGYzMTYzMzNlIn0%3D%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%22%2C%22value%22%3A%22%22%7D%2C%22%24device_id%22%3A%22194f3e8f315135a-0b95bcb772f8c4-1d525636-1930176-194f3e8f316333e%22%7D; uu=a8367af0-e921-11ef-ab33-8b8bfa0135f6; cid=1; ai=1; moa_deviceId=0844B4145EBE5E83AEFF69692B35BE7D; dx-sso=eAGFjz1Lw1AYhbmLtJv4CzI4SEG59-ZN8r6OoRjrJBS0dZH7CaVakBKToZNDoWAdOmYqopt_QXBzdnPwT7hZ6GAzOLuc6Zzn4TTY9sPHlAXzp-e7lZRb5fV-qQaHAZKPDBmtIqtBSFDAoWUjC9YrI32UvrCd5rnTXeNGbhJUs9f3tdxj8t8h1rrj-9Xn9Eeezr7nb19ywRp_pIod8Ji8BpMIQOER0MZIIDZikyTcGn4pEpBYR0gUP7LdwumJRYEOgUtBHLwg9DYUpGJHZlMO8SKwTqIWiYlcy0GMiihUFCEpnhjiVi9Y0GsX_Twt9dHwbHyrTrogrzrDXuZUZ5z122lWsWaRl7m7GajRks3X9YVfxaRnYw**eAENycEBwCAIA8CVwBZIxtEU9h_B3vewBxmImjUQTfTz8ZANL6ZDZml_9tNcWhMvJqHeiizYBTOhEVs**Iem6MpjUPxaqTr0x0ihSfwpQsWhMYYxnJMZWjZhFbl6-9Fs3GhGgqaIu2EoSnyJuGZR1Y-aTYIcIAc4OoPii2Q**MjIwNTgzOCx3dXh1ZXFpYW4s5ZC05a2m6LCmLHd1eHVlcWlhbkB0ZXN0LmNvbSwxLDAzMDUxNzA2LDE3NTA0NzI0MTM3MDk; dx-sign=Eb7q5PHNqRLDN_mkYfVY7oztb729AbaZHFr-cW5mdSSHyuEZMC5PjVIZJmwxfJYPWFIUvViu1myBshOGPBkgFIP9HW1OiWHW3JchgubMv7fjtneL9TIVXPGYq4lz53v4i0Hz736Zcncxh4zh7qXA_aRmSdG4J9T4z_3RfEFgzyU=; al=mgosidkayojfzopcuggueahmbfcnuoqm; u=7079987; ct_misid=wuxueqian; logan_session_token=tx6ejhlyzf4k4zttqzc7; WEBDFPID=68wv61zy7y9650u8y5w90u9453815z44805vu9536z7579586xxw3372-1750730659998-1739176825765CSGWYGQ75613c134b6a252faa6802015be905511200; s_m_id_3299326472=AwMAAAA5AgAAAAIAAAE9AAAALMzVnRcU3qucXpipOSWGfP58olEZ6mk6HQoCMwHnCXkt+b1IgOeLbD6FrMi8AAAAI/hU1kdIPPSh/noB853xhmZT4BLnFqiIzJtOnbtf7Prgemmu; com.sankuai.it.ead.citadel_ssoid=eAGFjz0vBFEYhXO71YlSNYWCLSZz3_utYuwIG0J8hGjkvTPvyGQ_RNZaNiqFiEKhoxK_QCFRUm0pUagU_AGVRhRiFWrdKU7Oc54SGzx7OmZB7-b06AtgON1uhC1s1tpYhMVuSJiFabGLGdXHAy4wcpmWqBRIlYMzkSkToTOewJs8fmRDY2vkl1Nq0mFkpYwllyqJE5VYMZlMT2unHcRCxYmpBL2T54tvGGXw77D9vTgxMPNyf_v2CYsfveO7dzhnpT_WJQu9MwYig9aRNUCO5x6llZBZEeUC9SY30gjN-y0t4ZqNdMgfci0oNTZPQZFErWxqtAfe9-GAoPVGYBGpn1FRmWSae5ujNioS0nO0UeTOWdCabKwsLZjWereozM4T35uaqx6s89WVzHbrW9XaJRvotPfbtFNg84q9Pvwq_AA4UXcL**eAEFwQkBwDAIA0BN4wmpnACtfwm7i-IoaW1Wm3csCR6hdwZ87zq3BYaFOvSdHaDgwni13x9DYRH6**gfcKWylgH_eiafAICkZ2ohgLWa972OqQZBIKwP53LoylDZYapUpYhj4bXJ_9HNoQXQj5TETm2LSaNUZ6g-ordw**MjIwNTgzOCx3dXh1ZXFpYW4s5ZC05a2m6LCmLHd1eHVlcWlhbkBtZWl0dWFuLmNvbSwxLGVkY18yMjA1ODM4LDE3NTA3NDA0MDgzOTA; ct_token=eAGFjz0vBFEYhXO71YlSNYWCLSZz3_utYuwIG0J8hGjkvTPvyGQ_RNZaNiqFiEKhoxK_QCFRUm0pUagU_AGVRhRiFWrdKU7Oc54SGzx7OmZB7-b06AtgON1uhC1s1tpYhMVuSJiFabGLGdXHAy4wcpmWqBRIlYMzkSkToTOewJs8fmRDY2vkl1Nq0mFkpYwllyqJE5VYMZlMT2unHcRCxYmpBL2T54tvGGXw77D9vTgxMPNyf_v2CYsfveO7dzhnpT_WJQu9MwYig9aRNUCO5x6llZBZEeUC9SY30gjN-y0t4ZqNdMgfci0oNTZPQZFErWxqtAfe9-GAoPVGYBGpn1FRmWSae5ujNioS0nO0UeTOWdCabKwsLZjWereozM4T35uaqx6s89WVzHbrW9XaJRvotPfbtFNg84q9Pvwq_AA4UXcL**eAEFwQkBwDAIA0BN4wmpnACtfwm7i-IoaW1Wm3csCR6hdwZ87zq3BYaFOvSdHaDgwni13x9DYRH6**gfcKWylgH_eiafAICkZ2ohgLWa972OqQZBIKwP53LoylDZYapUpYhj4bXJ_9HNoQXQj5TETm2LSaNUZ6g-ordw**MjIwNTgzOCx3dXh1ZXFpYW4s5ZC05a2m6LCmLHd1eHVlcWlhbkBtZWl0dWFuLmNvbSwxLGVkY18yMjA1ODM4LDE3NTA3NDA0MDgzOTA; _lxsdk_s=1979b7fc789-639-c8c-a0e%7C%7C27", // DEMO
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
};

// 获取表格列表
export const getTables = async (
  pageId: string
): Promise<{ tableId: number; title: string; version: number }[]> => {
  const cacheKey = `xtable_tables_${pageId}`;
  const cache = cacheManager.get(cacheKey);

  if (cache) {
    return JSON.parse(cache);
  }

  const resp = await fetch(`${KM_API_BASE}/api/xtable/${pageId}`, { headers });

  if (!resp.ok) {
    throw new Error("获取数据表列表信息失败");
  }

  const result = await resp.json();

  cacheManager.set(cacheKey, JSON.stringify(result.data));

  return result.data;
};

// TODO models 视图区分
export const getTableMeta = async (
  tableId: number
): Promise<{
  version: number;
  columns: {
    id: number;
    name: string;
    columnType: number;
    rawType: number;
    config: string;
  }[];
  deletedRowIds: number[];
}> => {
  const cacheKey = `xtable_table_meta_${tableId}`;
  const cache = cacheManager.get(cacheKey);

  if (cache) {
    return JSON.parse(cache);
  }

  const resp = await fetch(
    `${KM_API_BASE}/api/collaboration/xtable/${tableId}/meta`,
    {
      headers,
    }
  );

  if (!resp.ok) {
    throw new Error("获取数据表信息失败");
  }

  const result = await resp.json();

  cacheManager.set(cacheKey, JSON.stringify(result.data));

  return result.data;
};

const getTableRowsOfColumnWithSequence = async (
  tableId: number,
  columnId: number,
  version: number,
  sequence: number
): Promise<{
  columnData: string[];
  endRowId: number;
  startRowId: number;
  rowIds: number[];
}> => {
  const cacheKey = `xtable_table_rows_${tableId}_${columnId}_${sequence}_${version}`;
  const cache = cacheManager.get(cacheKey);

  if (cache) {
    return JSON.parse(cache);
  }

  const resp = await fetch(
    `${KM_API_BASE}/api/collaboration/xtable/${tableId}/chunkData?columnId=${columnId}&sequence=${sequence}&currentVersion=${version}`,
    { headers }
  );

  if (!resp.ok) {
    throw new Error("获取行数据失败");
  }

  const result = await resp.json();

  cacheManager.set(cacheKey, JSON.stringify(result.data));

  return result.data;
};

export const getTableRowsOfColumn = async (
  tableId: number,
  columnId: number,
  version: number
) => {
  // 暂时只处理第一页
  return getTableRowsOfColumnWithSequence(tableId, columnId, version, 0);
};

export const getAllRows = async (tableId: number) => {
  const meta = await getTableMeta(tableId);
  const rows: Record<string, any>[] = [];
  for (const col of meta.columns) {
    const data = await getTableRowsOfColumn(tableId, col.id, meta.version);
    // 处理已经删除的行
    const columnData = (data.columnData || []).filter(
      (_, i) => !(meta.deletedRowIds || []).includes(data.rowIds[i])
    );
    for (let i = 0; i < columnData.length; i++) {
      const row = rows[i] || {};
      row[col.name] = columnData[i];
      rows[i] = row;
    }

    // TODO confirm 是否统计自动创建的空行（多维表格 UI 是包含统计的）
  }

  return rows;
};
