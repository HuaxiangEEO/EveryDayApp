import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await windowManager.ensureInitialized();
  const size = Size(1100, 700);
  const minSize = Size(800, 500);
  await windowManager.waitUntilReadyToShow(
    null,
    () async {
      await windowManager.setTitle('网盘文件管理');
      await windowManager.setSize(size);
      await windowManager.setMinimumSize(minSize);
      await windowManager.center();
      await windowManager.show();
    },
  );
  runApp(const CloudStorageApp());
}

class CloudStorageApp extends StatelessWidget {
  const CloudStorageApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '网盘文件管理',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.dark(
          primary: const Color(0xFF00D4AA),
          secondary: const Color(0xFF7C3AED),
          surface: const Color(0xFF0F1419),
          error: const Color(0xFFE53935),
        ),
        scaffoldBackgroundColor: const Color(0xFF0F1419),
        fontFamily: 'Segoe UI',
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF161D26),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        cardTheme: CardThemeData(
          color: const Color(0xFF161D26),
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
      home: const HomeScreen(),
    );
  }
}
