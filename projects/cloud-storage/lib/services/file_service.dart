import 'dart:io';
import 'package:path/path.dart' as p;
import '../models/file_item.dart';

/// 文件服务：本地文件系统读写、目录遍历
class FileService {
  /// 列出目录下的文件和文件夹
  Future<List<FileItem>> listDirectory(String dirPath) async {
    final dir = Directory(dirPath);
    if (!await dir.exists()) return [];
    final items = <FileItem>[];
    await for (final entity in dir.list(followLinks: false)) {
      try {
        final stat = await entity.stat();
        items.add(FileItem(
          name: p.basename(entity.path),
          path: entity.path,
          isDirectory: stat.type == FileSystemEntityType.directory,
          size: stat.type == FileSystemEntityType.file ? await File(entity.path).length() : null,
          modifiedTime: stat.modified,
        ));
      } catch (_) {}
    }
    items.sort((a, b) {
      if (a.isDirectory != b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.toLowerCase().compareTo(b.name.toLowerCase());
    });
    return items;
  }

  /// 创建文件夹
  Future<bool> createDirectory(String parentPath, String name) async {
    try {
      final dir = Directory(p.join(parentPath, name));
      await dir.create(recursive: true);
      return true;
    } catch (_) {
      return false;
    }
  }

  /// 删除文件或文件夹
  Future<bool> delete(String path) async {
    try {
      final entity = FileSystemEntity.typeSync(path);
      if (entity == FileSystemEntityType.directory) {
        await Directory(path).delete(recursive: true);
      } else {
        await File(path).delete();
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  /// 重命名
  Future<bool> rename(String oldPath, String newName) async {
    try {
      final parent = p.dirname(oldPath);
      final newPath = p.join(parent, newName);
      await FileSystemEntity.isDirectory(oldPath)
          ? Directory(oldPath).rename(newPath)
          : File(oldPath).rename(newPath);
      return true;
    } catch (_) {
      return false;
    }
  }

  /// 复制文件到目标目录
  Future<bool> copyFile(String srcPath, String destDir) async {
    try {
      final file = File(srcPath);
      final dest = File(p.join(destDir, p.basename(srcPath)));
      await file.copy(dest.path);
      return true;
    } catch (_) {
      return false;
    }
  }

  /// 复制文件到指定目标路径（用于另存为）
  Future<bool> copyToPath(String srcPath, String destPath) async {
    try {
      await File(srcPath).copy(destPath);
      return true;
    } catch (_) {
      return false;
    }
  }

  /// 检查路径是否存在
  Future<bool> exists(String path) async {
    try {
      final type = await FileSystemEntity.type(path);
      return type != FileSystemEntityType.notFound;
    } catch (_) {
      return false;
    }
  }
}
