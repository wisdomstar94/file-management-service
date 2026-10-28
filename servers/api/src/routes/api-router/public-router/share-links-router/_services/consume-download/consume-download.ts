import { API_ERROR_CODE } from "@fms/common-utils/errors/api-error-code";
import { ShareLinkDownloadLogEntity } from "@fms/database-entities/entities/share-link-download-log-entity";
import { HttpError } from "#/classes/http-error/index.js";
import { appDataSource } from "#/singleton-classes/app-data-source/index.js";

/**
 * 기간 · 허용 수를 만족할 때만 다운로드 수를 1 올리고 이력을 남긴다.
 * 동시에 여러 요청이 와도 허용 수를 넘지 않도록 조건부 UPDATE 한 번으로 판정한다.
 */
export async function consumeDownload(props: { linkId: string; versionId: string; ip: string }): Promise<void> {
  await appDataSource.transaction(async (manager) => {
    const updated: unknown[] = await manager.query(
      `UPDATE share_link SET download_count = download_count + 1
        WHERE id = $1
          AND (max_download_count IS NULL OR download_count < max_download_count)
          AND (available_from IS NULL OR available_from <= now())
          AND (available_until IS NULL OR available_until >= now())
        RETURNING id`,
      [props.linkId],
    );
    const isConsumed = Array.isArray(updated[0]) ? updated[0].length > 0 : updated.length > 0;
    if (!isConsumed) {
      throw new HttpError(409, API_ERROR_CODE.CONFLICT, "다운로드 가능 기간이 아니거나 허용 횟수를 모두 사용했습니다.");
    }
    await manager.getRepository(ShareLinkDownloadLogEntity).insert({
      shareLinkId: props.linkId,
      documentVersionId: props.versionId,
      ip: props.ip,
    });
  });
}
