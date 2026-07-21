// vite.config.ts
import react from "file:///C:/Users/mijsters/Documents/LNCOai/apps/n-back-working-memory/node_modules/@vitejs/plugin-react/dist/index.js";
import { resolve } from "path";
import { defineConfig, loadEnv } from "file:///C:/Users/mijsters/Documents/LNCOai/apps/n-back-working-memory/node_modules/vite/dist/node/index.js";
import checker from "file:///C:/Users/mijsters/Documents/LNCOai/apps/n-back-working-memory/node_modules/vite-plugin-checker/dist/esm/main.js";
import istanbul from "file:///C:/Users/mijsters/Documents/LNCOai/apps/n-back-working-memory/node_modules/vite-plugin-istanbul/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\mijsters\\Documents\\LNCOai\\apps\\n-back-working-memory";
var vite_config_default = ({ mode }) => {
  process.env = {
    VITE_VERSION: "default",
    VITE_BUILD_TIMESTAMP: (/* @__PURE__ */ new Date()).toISOString(),
    ...process.env,
    ...loadEnv(mode, process.cwd())
  };
  return defineConfig({
    base: "",
    server: {
      port: parseInt(process.env.VITE_PORT, 10) || 4001,
      open: mode !== "test",
      // open only when mode is different from test
      watch: {
        ignored: ["**/coverage/**", "**/cypress/downloads/**"]
      },
      proxy: {
        "/app-items": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app-items/, "/app-items")
        }
      }
    },
    preview: {
      port: parseInt(process.env.VITE_PORT || "3333", 10),
      strictPort: true
    },
    build: {
      outDir: "build"
    },
    plugins: [
      mode === "test" ? void 0 : checker({
        typescript: true,
        eslint: {
          lintCommand: 'eslint "src/**/*.{ts,tsx}"'
        }
      }),
      react(),
      istanbul({
        include: "src/*",
        exclude: ["node_modules", "test/", ".nyc_output", "coverage"],
        extension: [".js", ".ts", ".tsx"],
        requireEnv: false,
        forceBuildInstrument: mode === "test",
        checkProd: true
      })
    ],
    resolve: {
      alias: {
        "@": resolve(__vite_injected_original_dirname, "src")
      }
    }
  });
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtaWpzdGVyc1xcXFxEb2N1bWVudHNcXFxcTE5DT2FpXFxcXGFwcHNcXFxcbi1iYWNrLXdvcmtpbmctbWVtb3J5XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtaWpzdGVyc1xcXFxEb2N1bWVudHNcXFxcTE5DT2FpXFxcXGFwcHNcXFxcbi1iYWNrLXdvcmtpbmctbWVtb3J5XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9taWpzdGVycy9Eb2N1bWVudHMvTE5DT2FpL2FwcHMvbi1iYWNrLXdvcmtpbmctbWVtb3J5L3ZpdGUuY29uZmlnLnRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCIuL3NyYy9lbnZcIi8+XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgVXNlckNvbmZpZ0V4cG9ydCwgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCBjaGVja2VyIGZyb20gJ3ZpdGUtcGx1Z2luLWNoZWNrZXInO1xyXG5pbXBvcnQgaXN0YW5idWwgZnJvbSAndml0ZS1wbHVnaW4taXN0YW5idWwnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgKHsgbW9kZSB9OiB7IG1vZGU6IHN0cmluZyB9KTogVXNlckNvbmZpZ0V4cG9ydCA9PiB7XHJcbiAgcHJvY2Vzcy5lbnYgPSB7XHJcbiAgICBWSVRFX1ZFUlNJT046ICdkZWZhdWx0JyxcclxuICAgIFZJVEVfQlVJTERfVElNRVNUQU1QOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAuLi5wcm9jZXNzLmVudixcclxuICAgIC4uLmxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSksXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIGRlZmluZUNvbmZpZyh7XHJcbiAgICBiYXNlOiAnJyxcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICBwb3J0OiBwYXJzZUludChwcm9jZXNzLmVudi5WSVRFX1BPUlQsIDEwKSB8fCA0MDAxLFxyXG4gICAgICBvcGVuOiBtb2RlICE9PSAndGVzdCcsIC8vIG9wZW4gb25seSB3aGVuIG1vZGUgaXMgZGlmZmVyZW50IGZyb20gdGVzdFxyXG4gICAgICB3YXRjaDoge1xyXG4gICAgICAgIGlnbm9yZWQ6IFsnKiovY292ZXJhZ2UvKionLCAnKiovY3lwcmVzcy9kb3dubG9hZHMvKionXSxcclxuICAgICAgfSxcclxuICAgICAgcHJveHk6IHtcclxuICAgICAgICAnL2FwcC1pdGVtcyc6IHtcclxuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBwLWl0ZW1zLywgJy9hcHAtaXRlbXMnKSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHByZXZpZXc6IHtcclxuICAgICAgcG9ydDogcGFyc2VJbnQocHJvY2Vzcy5lbnYuVklURV9QT1JUIHx8ICczMzMzJywgMTApLFxyXG4gICAgICBzdHJpY3RQb3J0OiB0cnVlLFxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIG91dERpcjogJ2J1aWxkJyxcclxuICAgIH0sXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIG1vZGUgPT09ICd0ZXN0J1xyXG4gICAgICAgID8gdW5kZWZpbmVkXHJcbiAgICAgICAgOiBjaGVja2VyKHtcclxuICAgICAgICAgICAgdHlwZXNjcmlwdDogdHJ1ZSxcclxuICAgICAgICAgICAgZXNsaW50OiB7XHJcbiAgICAgICAgICAgICAgbGludENvbW1hbmQ6ICdlc2xpbnQgXCJzcmMvKiovKi57dHMsdHN4fVwiJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0pLFxyXG4gICAgICByZWFjdCgpLFxyXG4gICAgICBpc3RhbmJ1bCh7XHJcbiAgICAgICAgaW5jbHVkZTogJ3NyYy8qJyxcclxuICAgICAgICBleGNsdWRlOiBbJ25vZGVfbW9kdWxlcycsICd0ZXN0LycsICcubnljX291dHB1dCcsICdjb3ZlcmFnZSddLFxyXG4gICAgICAgIGV4dGVuc2lvbjogWycuanMnLCAnLnRzJywgJy50c3gnXSxcclxuICAgICAgICByZXF1aXJlRW52OiBmYWxzZSxcclxuICAgICAgICBmb3JjZUJ1aWxkSW5zdHJ1bWVudDogbW9kZSA9PT0gJ3Rlc3QnLFxyXG4gICAgICAgIGNoZWNrUHJvZDogdHJ1ZSxcclxuICAgICAgfSksXHJcbiAgICBdLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgICdAJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSk7XHJcbn07XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBQ3hCLFNBQTJCLGNBQWMsZUFBZTtBQUN4RCxPQUFPLGFBQWE7QUFDcEIsT0FBTyxjQUFjO0FBTHJCLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsQ0FBQyxFQUFFLEtBQUssTUFBMEM7QUFDL0QsVUFBUSxNQUFNO0FBQUEsSUFDWixjQUFjO0FBQUEsSUFDZCx1QkFBc0Isb0JBQUksS0FBSyxHQUFFLFlBQVk7QUFBQSxJQUM3QyxHQUFHLFFBQVE7QUFBQSxJQUNYLEdBQUcsUUFBUSxNQUFNLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDaEM7QUFFQSxTQUFPLGFBQWE7QUFBQSxJQUNsQixNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixNQUFNLFNBQVMsUUFBUSxJQUFJLFdBQVcsRUFBRSxLQUFLO0FBQUEsTUFDN0MsTUFBTSxTQUFTO0FBQUE7QUFBQSxNQUNmLE9BQU87QUFBQSxRQUNMLFNBQVMsQ0FBQyxrQkFBa0IseUJBQXlCO0FBQUEsTUFDdkQ7QUFBQSxNQUNBLE9BQU87QUFBQSxRQUNMLGNBQWM7QUFBQSxVQUNaLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxnQkFBZ0IsWUFBWTtBQUFBLFFBQzlEO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE1BQU0sU0FBUyxRQUFRLElBQUksYUFBYSxRQUFRLEVBQUU7QUFBQSxNQUNsRCxZQUFZO0FBQUEsSUFDZDtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLElBQ1Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLFNBQVMsU0FDTCxTQUNBLFFBQVE7QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLFFBQVE7QUFBQSxVQUNOLGFBQWE7QUFBQSxRQUNmO0FBQUEsTUFDRixDQUFDO0FBQUEsTUFDTCxNQUFNO0FBQUEsTUFDTixTQUFTO0FBQUEsUUFDUCxTQUFTO0FBQUEsUUFDVCxTQUFTLENBQUMsZ0JBQWdCLFNBQVMsZUFBZSxVQUFVO0FBQUEsUUFDNUQsV0FBVyxDQUFDLE9BQU8sT0FBTyxNQUFNO0FBQUEsUUFDaEMsWUFBWTtBQUFBLFFBQ1osc0JBQXNCLFNBQVM7QUFBQSxRQUMvQixXQUFXO0FBQUEsTUFDYixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxNQUMvQjtBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUM7QUFDSDsiLAogICJuYW1lcyI6IFtdCn0K
