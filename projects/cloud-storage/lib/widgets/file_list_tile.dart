import 'package:flutter/material.dart';
import '../models/file_item.dart';

class FileListTile extends StatelessWidget {
  final FileItem item;
  final VoidCallback? onTap;
  final VoidCallback? onDelete;
  final VoidCallback? onRename;
  final VoidCallback? onDownload;

  const FileListTile({
    super.key,
    required this.item,
    this.onTap,
    this.onDelete,
    this.onRename,
    this.onDownload,
  });

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: item.isDirectory ? SystemMouseCursors.click : SystemMouseCursors.basic,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: item.isDirectory ? onTap : null,
          onSecondaryTap: () => _showContextMenu(context),
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Icon(
                  item.isDirectory ? Icons.folder : Icons.insert_drive_file,
                  size: 32,
                  color: item.isDirectory
                      ? const Color(0xFF00D4AA)
                      : Colors.white54,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.name,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (item.displaySize.isNotEmpty || item.displayTime.isNotEmpty)
                        Text(
                          '${item.displaySize} ${item.displayTime}'.trim(),
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                    ],
                  ),
                ),
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert, size: 20),
                  onSelected: (v) {
                    if (v == 'rename') onRename?.call();
                    if (v == 'delete') onDelete?.call();
                    if (v == 'download') onDownload?.call();
                  },
                  itemBuilder: (_) => [
                    if (!item.isDirectory && onDownload != null)
                      const PopupMenuItem(value: 'download', child: Text('另存为')),
                    const PopupMenuItem(value: 'rename', child: Text('重命名')),
                    const PopupMenuItem(value: 'delete', child: Text('删除', style: TextStyle(color: Colors.red))),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showContextMenu(BuildContext context) {
    final items = <PopupMenuItem<String>>[
      if (!item.isDirectory && onDownload != null)
        const PopupMenuItem(value: 'download', child: Text('另存为')),
      const PopupMenuItem(value: 'rename', child: Text('重命名')),
      const PopupMenuItem(value: 'delete', child: Text('删除', style: TextStyle(color: Colors.red))),
    ];
    showMenu<String>(context: context, position: const RelativeRect.fromLTRB(100, 100, 200, 200), items: items)
        .then((v) {
      if (v == 'rename') onRename?.call();
      if (v == 'delete') onDelete?.call();
      if (v == 'download') onDownload?.call();
    });
  }
}
