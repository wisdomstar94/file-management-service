const ICONS: { extensions: string[]; icon: string; color: string }[] = [
  { extensions: ["pdf"], icon: "ti-file-type-pdf", color: "#d64545" },
  { extensions: ["ppt", "pptx", "key"], icon: "ti-presentation", color: "#d9782d" },
  { extensions: ["xls", "xlsx", "csv"], icon: "ti-file-spreadsheet", color: "#1f9d6b" },
  { extensions: ["doc", "docx", "hwp", "txt", "md"], icon: "ti-file-text", color: "#4f5bd5" },
  { extensions: ["zip", "7z", "tar", "gz", "rar"], icon: "ti-file-zip", color: "#9a6512" },
  { extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg"], icon: "ti-photo", color: "#7a5bd5" },
  { extensions: ["exe", "msi", "dmg", "pkg", "apk"], icon: "ti-package", color: "#5b6270" },
  { extensions: ["json", "js", "ts", "html", "xml", "yaml", "yml"], icon: "ti-file-code", color: "#5b6270" },
];

/** 파일명 확장자로 tabler 아이콘 클래스와 색을 고른다. 모르는 확장자는 일반 파일 아이콘 */
export function readFileIcon(fileName: string): { icon: string; color: string } {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const matched = ICONS.find((item) => item.extensions.includes(extension));
  return matched ? { icon: matched.icon, color: matched.color } : { icon: "ti-file", color: "#5b6270" };
}
