import 'package:flutter/material.dart';

class Toolbar extends StatelessWidget {
  final VoidCallback? onUpload;
  final VoidCallback? onNewFolder;
  final VoidCallback? onRefresh;
  final VoidCallback? onBack;

  const Toolbar({
    super.key,
    this.onUpload,
    this.onNewFolder,
    this.onRefresh,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: const BoxDecoration(
        color: Color(0xFF161D26),
        border: Border(bottom: BorderSide(color: Color(0xFF252D38), width: 1)),
      ),
      child: Row(
        children: [
          if (onBack != null)
            IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: onBack,
              tooltip: '返回上级',
            ),
          const SizedBox(width: 8),
          _ToolButton(icon: Icons.upload_file, label: '上传', onPressed: onUpload),
          const SizedBox(width: 8),
          _ToolButton(icon: Icons.create_new_folder, label: '新建文件夹', onPressed: onNewFolder),
          const SizedBox(width: 8),
          _ToolButton(icon: Icons.refresh, label: '刷新', onPressed: onRefresh),
        ],
      ),
    );
  }
}

class _ToolButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onPressed;

  const _ToolButton({required this.icon, required this.label, this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(6),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 20, color: const Color(0xFF00D4AA)),
              const SizedBox(width: 6),
              Text(label, style: const TextStyle(fontSize: 13)),
            ],
          ),
        ),
      ),
    );
  }
}
