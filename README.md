# 📊 Logwork

Công cụ CLI để quản lý và xuất báo cáo log công việc từ Linear.

## ✨ Tính năng

- 🎯 Lấy log công việc từ Linear comments
- 📅 Hỗ trợ nhiều định dạng ngày tháng (DD/MM/YYYY, DD/MM, DD-MM, YYYY-MM-DD)
- 🔄 Nhiều tùy chọn thời gian (hôm nay, hôm qua, 7 ngày, 30 ngày, tùy chỉnh)
- 💬 Interactive mode mặc định
- 📋 Tự động format cho Slack trong markdown code block
- 🎨 Hiển thị đẹp với màu sắc và tổng hợp giờ

## 📦 Cài đặt

```bash
# Clone repository
git clone <repo-url>
cd logwork

# Cài đặt dependencies
pnpm install

# Build
pnpm build

# Link globally để sử dụng ở mọi nơi
pnpm link --global
```

## ⚙️ Cấu hình

Tạo file `.env` trong thư mục gốc:

```env
LINEAR_API_KEY=your_linear_api_key_here
```

Lấy Linear API key tại: https://linear.app/settings/api

## 🚀 Sử dụng

### Interactive Mode (Mặc định)

```bash
logwork
```

Sẽ hiển thị menu để chọn:
- Hôm nay
- Hôm qua
- 7 ngày gần đây
- 30 ngày gần đây
- 2 tuần gần đây
- Tùy chỉnh khoảng thời gian

### Command Line Options

```bash
# Xem log hôm nay
logwork --today

# Xem log hôm qua
logwork --yesterday

# Xem log 7 ngày gần đây
logwork --range 7d

# Xem log 30 ngày gần đây
logwork --range 30d

# Xem log 2 tuần gần đây
logwork --range 2w

# Xem log từ ngày cụ thể đến hôm nay
logwork --from 25/12/2025

# Xem log trong khoảng thời gian
logwork --from 20/12/2025 --to 30/12/2025

# Định dạng ngày hỗ trợ
logwork --from 2025-12-20 --to 2025-12-30
logwork --from 20/12/2025 --to 30/12/2025
logwork --from 20-12-2025 --to 30-12-2025
```

## 📝 Format Log Work trong Linear

Để CLI nhận diện được log work, comment trong Linear cần theo format:

```
log 2h
log work 3.5h
worklog: 4h
logged 1.5h
```

Tùy chọn: Thêm ngày cụ thể (nếu không có sẽ lấy ngày tạo comment):

```
25/12/2025 log 2h
log 3h 26/12/2025
```

## 📤 Output

### 1. Detailed Format

```
29/12/2025:
  https://linear.app/workspace/issue/NOW-23531: 2h
  https://linear.app/workspace/issue/NOW-23724: 1.5h
  Tổng ngày: 3.5h

30/12/2025:
  https://linear.app/workspace/issue/NOW-23935: 3h
  Tổng ngày: 3h

📊 Tổng số giờ: 6.5h
```

### 2. Slack Format (để copy)

```
📋 Format cho Slack (copy bên dưới):
29/12/2025
```
https://linear.app/workspace/issue/NOW-23531
https://linear.app/workspace/issue/NOW-23724
```

30/12/2025
```
https://linear.app/workspace/issue/NOW-23935
```
```

## 🏗️ Cấu trúc Project

```
src/
├── index.ts                 # Entry point & CLI setup
├── constants.ts            # Regex patterns & constants
├── env.ts                  # Environment configuration
├── linear.ts               # Linear API client
├── funcs/
│   └── get-work-logs.ts   # Core logic lấy & group logs
└── utils/
    ├── index.ts           # Re-export all utils
    ├── cli-handler.ts     # Xử lý CLI options
    ├── date-parser.ts     # Parse dates & date ranges
    ├── date-utils.ts      # Date extraction từ text
    ├── display.ts         # Display & formatting
    ├── interactive.ts     # Interactive mode
    ├── regex-utils.ts     # Regex matching & extraction
    └── url-utils.ts       # Linear URL processing
```

## 🛠️ Development

```bash
# Run in dev mode
pnpm dev

# Build
pnpm build

# Type check
pnpm typecheck

# Format & lint
pnpm check
```

## 📋 Scripts

- `pnpm build` - Build project
- `pnpm dev` - Watch mode
- `pnpm typecheck` - Type checking
- `pnpm check` - Format & lint with Biome
- `pnpm start` - Run built version

## 🤝 Contributing

Pull requests are welcome!

## 📄 License

MIT
