/**
 * `API_TRUST_PROXY` 값을 express `trust proxy` 설정으로 바꾼다.
 * 비어 있으면 `false`(직접 연결 IP 사용), 숫자면 홉 수, 그 외는 `loopback, 10.0.0.0/8` 같은 신뢰 대상 목록이다.
 */
export function readTrustProxySetting(value: string): boolean | number | string {
  if (value === "") {
    return false;
  }
  if (/^\d+$/.test(value)) {
    return Number(value);
  }
  return value;
}
