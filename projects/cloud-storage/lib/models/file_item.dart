/// 文件/文件夹项模型，统一表示本地或云端文件
class FileItem {
  final String name;
  final String path;
  final bool isDirectory;
  final int? size;
  final DateTime? modifiedTime;
  final String? mimeType;

  const FileItem({
    required this.name,
    required this.path,
    this.isDirectory = false,
    this.size,
    this.modifiedTime,
    this.mimeType,
  });

  String get displaySize {
    if (size == null || isDirectory) return '';
    if (size! < 1024) return '$size B';
    if (size! < 1024 * 1024) return '${(size! / 1024).toStringAsFixed(1)} KB';
    if (size! < 1024 * 1024 * 1024) return '${(size! / 1024 / 1024).toStringAsFixed(1)} MB';
    return '${(size! / 1024 / 1024 / 1024).toStringAsFixed(1)} GB';
  }

  String get displayTime => modifiedTime != null
      ? '${modifiedTime!.year}-${modifiedTime!.month.toString().padLeft(2, '0')}-${modifiedTime!.day.toString().padLeft(2, '0')} '
        '${modifiedTime!.hour.toString().padLeft(2, '0')}:${modifiedTime!.minute.toString().padLeft(2, '0')}'
      : '';
}
