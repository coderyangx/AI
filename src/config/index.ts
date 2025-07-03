export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE || 'http://localhost:8000',
  openApiKey: import.meta.env.VITE_OPEN_API_KEY,
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
} as const;

export const getCookie = () => {
  console.log('获取cookie: ', document.cookie);
  const cookie =
    '_lxsdk_cuid=1891a120f98c8-0bc449f3aceb4c-1b525634-1d73c0-1891a120f98c8; _lxsdk=1891a120f98c8-0bc449f3aceb4c-1b525634-1d73c0-1891a120f98c8; s_u_745896=dmzoNwi5VM71V/7p2hpOVw==; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%221966692aac82598-0d2646ef7ec55b-1a525636-3686400-1966692aac931da%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMTk2NjY5MmFhYzgyNTk4LTBkMjY0NmVmN2VjNTViLTFhNTI1NjM2LTM2ODY0MDAtMTk2NjY5MmFhYzkzMWRhIn0%3D%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%22%2C%22value%22%3A%22%22%7D%2C%22%24device_id%22%3A%221966692aac82598-0d2646ef7ec55b-1a525636-3686400-1966692aac931da%22%7D; moaDeviceId=AB5A90BC13AF58BA811145A5D10D24E2; WEBDFPID=0yv23zu809515y681346wv5425vuv5978057zv1u4695795838x53v08-1750399404192-1735886697524CAQCQQQ75613c134b6a252faa6802015be905514072; com.sankuai.speechfe.ai.factory_strategy=; s_m_id_3299326472=AwMAAAA5AgAAAAIAAAE9AAAALMzVnRcU3qucXpipOSWGfP58olEZ6mk6HQoCMwHnCXkt+b1IgOeLbD6FrMi8AAAAJNmZxzZg3Z7iSfIMF27SKHWclVIfeOttRtpMaM6o33JhP1fOkQ==; logan_session_token=y25d29jgq8bs1subw9tz; _lxsdk_s=1979654f7e4-4d6-38b-e10%7C%7C126';
  return cookie || document.cookie;
};
