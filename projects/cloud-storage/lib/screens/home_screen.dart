import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:path/path.dart' as p;
import '../models/file_item.dart';
import '../services/file_service.dart';
import '../widgets/file_list_tile.dart';
import '../widgets/toolbar.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final FileService _fileService = FileService();
  final List<String> _breadcrumbs = [];
  List<FileItem> _items = [];
  bool _loading = false;
  String? _error;
  String _currentPath = '';

  @override
  void initState() {
    super.initState();
    _loadInitialPath();
  }

  Future<void> _loadInitialPath() async {
    _loading = true;
    _error = null;
    setState(() {});
    try {
      final docDir = await _getDocumentsPath();
      if (docDir != null) {
        _navigateTo(docDir);
      } else {
        _error = '无法获取文档目录';
      }
    } catch (e) {
      _error = e.toString();
    }
    _loading = false;
    setState(() {});
  }

  Future<String?> _getDocumentsPath() async {
    try {
      if (Platform.isWindows) {
        final dir = Directory(
          p.join(Platform.environment['USERPROFILE'] ?? '', 'Documents'),
        );
        if (await dir.exists()) return dir.path;
      } else {
        final dir = Directory(
          p.join(Platform.environment['HOME'] ?? '', 'Documents'),
        );
        if (await dir.exists()) return dir.path;
      }
    } catch (_) {}
    return null;
  }

  Future<void> _navigateTo(String path) async {
    _currentPath = path;
    _breadcrumbs.clear();
    String remaining = path;
    String? prev;
    while (remaining.isNotEmpty && remaining != prev) {
      final name = p.basename(remaining);
      if (name.isNotEmpty) _breadcrumbs.insert(0, name);
      prev = remaining;
      remaining = p.dirname(remaining);
    }
    await _refresh();
  }

  Future<void> _refresh() async {
    if (_currentPath.isEmpty) return;
    _loading = true;
    _error = null;
    setState(() {});
    try {
      _items = await _fileService.listDirectory(_currentPath);
    } catch (e) {
      _error = e.toString();
    }
    _loading = false;
    setState(() {});
  }

  Future<void> _onItemTap(FileItem item) async {
    if (item.isDirectory) {
      _navigateTo(item.path);
    }
  }

  Future<void> _onUpload() async {
    final result = await FilePicker.platform.pickFiles(allowMultiple: true);
    if (result == null || result.files.isEmpty) return;
    for (final f in result.files) {
      if (f.path != null) {
        await _fileService.copyFile(f.path!, _currentPath);
      }
    }
    await _refresh();
  }

  Future<void> _onNewFolder() async {
    final name = await _showInputDialog('新建文件夹', '请输入文件夹名称', '新建文件夹');
    if (name == null || name.isEmpty) return;
    final ok = await _fileService.createDirectory(_currentPath, name);
    if (ok) {
      await _refresh();
    } else {
      if (mounted) _showSnack('创建失败');
    }
  }

  Future<void> _onDelete(FileItem item) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('确认删除'),
        content: Text('确定要删除 "${item.name}" 吗？'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('取消')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('删除', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    final ok = await _fileService.delete(item.path);
    if (ok) {
      await _refresh();
    } else {
      if (mounted) _showSnack('删除失败');
    }
  }

  Future<void> _onDownload(FileItem item) async {
    if (item.isDirectory) return;
    final destPath = await FilePicker.platform.saveFile(
      dialogTitle: '另存为',
      fileName: item.name,
    );
    if (destPath == null) return;
    final ok = await _fileService.copyToPath(item.path, destPath);
    if (ok) {
      if (mounted) _showSnack('已保存');
    } else {
      if (mounted) _showSnack('保存失败');
    }
  }

  Future<void> _onRename(FileItem item) async {
    final name = await _showInputDialog('重命名', '请输入新名称', item.name);
    if (name == null || name.isEmpty) return;
    final ok = await _fileService.rename(item.path, name);
    if (ok) {
      await _refresh();
    } else {
      if (mounted) _showSnack('重命名失败');
    }
  }

  Future<String?> _showInputDialog(String title, String hint, String initial) async {
    final ctrl = TextEditingController(text: initial);
    return showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: TextField(
          controller: ctrl,
          decoration: InputDecoration(hintText: hint),
          autofocus: true,
          onSubmitted: (_) => Navigator.pop(ctx, ctrl.text),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('取消')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, ctrl.text),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  void _onBreadcrumbTap(int index) {
    final parts = _breadcrumbs.take(index + 1).toList();
    if (parts.isEmpty) return;
    final root = _currentPath.split(RegExp(r'[/\\]')).first;
    final path = p.joinAll([root, ...parts]);
    _navigateTo(path);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Toolbar(
            onUpload: _onUpload,
            onNewFolder: _onNewFolder,
            onRefresh: _refresh,
            onBack: _breadcrumbs.length > 1
                ? () => _onBreadcrumbTap(_breadcrumbs.length - 2)
                : null,
          ),
          _buildBreadcrumb(),
          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildBreadcrumb() {
    if (_breadcrumbs.isEmpty) return const SizedBox.shrink();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      color: const Color(0xFF161D26),
      child: Row(
        children: [
          ...List.generate(_breadcrumbs.length, (i) {
            return Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (i > 0) const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 6),
                  child: Text('/', style: TextStyle(color: Colors.grey)),
                ),
                GestureDetector(
                  onTap: () => _onBreadcrumbTap(i),
                  child: Text(
                    _breadcrumbs[i],
                    style: TextStyle(
                      color: i == _breadcrumbs.length - 1
                          ? const Color(0xFF00D4AA)
                          : Colors.white70,
                      fontSize: 13,
                    ),
                  ),
                ),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF00D4AA)));
    }
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(_error!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _loadInitialPath,
              child: const Text('重试'),
            ),
          ],
        ),
      );
    }
    if (_currentPath.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.folder_open, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            const Text('选择或输入目录路径', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: () async {
                final path = await FilePicker.platform.getDirectoryPath();
                if (path != null) _navigateTo(path);
              },
              icon: const Icon(Icons.folder_open),
              label: const Text('选择文件夹'),
            ),
          ],
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _items.length,
      itemBuilder: (_, i) {
        final item = _items[i];
        return FileListTile(
          item: item,
          onTap: () => _onItemTap(item),
          onDelete: () => _onDelete(item),
          onRename: () => _onRename(item),
          onDownload: item.isDirectory ? null : () => _onDownload(item),
        );
      },
    );
  }
}
