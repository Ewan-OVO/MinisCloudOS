# 🟦 MS-S1 MAX WiFi Setup Guide (for Ubuntu Server 24.04)



MS-S1 MAX MT7925 WiFi 连接指导

> 本教程专为 **MS-S1 MAX 迷你主机** 在 **Ubuntu Server 24.04**环境下使用。
> 
> MS-S1 MAX 内置的 **Realtek RTL8127 10GbE 有线网卡** 在 Ubuntu Server 中默认 **无驱动**，
> 导致系统首次开机后 **无法使用有线网络**，从而无法在线安装驱动依赖包。
> 
> 幸运的是，MS-S1 MAX 的 WiFi 芯片 **MediaTek MT7925** 在 Ubuntu Server 中 **开箱即用**。
> 
> 因此本教程的目标是：
> 
> 1. **先通过内置 WiFi（MT7925）建立网络连接**
> 2. **再使用该网络安装 RTL8127 10GbE 有线网卡的驱动（例如 DKMS 模块）**
> 
> 本文步骤已在真实 MS-S1 MAX + Ubuntu Server 24.04 环境中验证成功，可安全复现。

---

## 📦 测试环境

| 项目 | 说明 |
|------|------|
| 设备 | MS-S1 MAX（MT7925 + RTL8127 10GbE） |
| 系统 | Ubuntu Server 24.04 LTS |
| 内核 | 6.8+ |
| 无线网卡 | MediaTek MT7925（自带驱动） |
| 有线网卡 | Realtek RTL8127 10GbE（需另行安装驱动） |
| 使用场景 | WiFi 启用 → 安装依赖 → 安装有线网卡驱动 |
| 工具链 | netplan + wpa_supplicant + systemd-networkd |

---

# 🛠 1. 检查无线网卡是否被识别

查看网卡列表：

```bash
ip link show
```

典型输出（带 wlpXXXX）：

```
2: wlp195s0: <BROADCAST,MULTICAST>
```

> 全文的 “wlp195s0” 仅供参照，以实际为准。

检查驱动：

```bash
lsmod | grep mt7925
```

预期输出：

```
mt7925e
mt7925_common
mt792x_lib
```

# 🛠 2. 创建 wpa\_supplicant 配置（WiFi 认证）

创建目录：

```bash
sudo mkdir -p /etc/wpa_supplicant
```

创建配置文件：

```bash
sudo nano /etc/wpa_supplicant/wpa_supplicant-wlp195s0.conf
```

填入：

```ini
ctrl_interface=DIR=/run/wpa_supplicant GROUP=netdev
update_config=1
country=CN

network={
    ssid="WiFi SSID"
    psk="WiFi password"
}
```

> 修改 SSID 与密码为你的 WiFi 信息，修改country为你的国家

---

# 🛠 3. 创建 netplan 网络配置

创建：

```bash
sudo nano /etc/netplan/01-wifi.yaml
```

写入（注意缩进是 2 空格）：

```yaml
network:
  version: 2
  renderer: networkd
  wifis:
    wlp195s0:
      dhcp4: true
      access-points:
        "WiFi SSID":
          password: "WiFi password"
      optional: true
```

设定权限：

```bash
sudo chmod 600 /etc/netplan/01-wifi.yaml
```

应用：

```bash
sudo netplan generate
sudo netplan apply
```

> 这一步仅激活网卡，不会自动连接 WiFi。

---

# 🛠 4. 启动 WiFi（wpa\_supplicant）

检查路径：

```bash
which wpa_supplicant
```

通常为：

```
/usr/sbin/wpa_supplicant
```

启动认证：

```bash
sudo wpa_supplicant -i wlp195s0 \
  -c /etc/wpa_supplicant/wpa_supplicant-wlp195s0.conf \
  -D nl80211 -B
```

成功会显示：

```
Successfully initialized wpa_supplicant
```

---

# 🛠 5. WiFi 获取 IP（系统自动 DHCP，无需 dhclient）

查看 IP：

```bash
ip addr show wlp195s0
```

正常示例：

```
inet [your ipwlp195s0]/23 scope global dynamic wlp195s0
```

测试连通性：

```bash
ping -c 3 8.8.8.8
ping -c 3 www.baidu.com
```

> 如果能 ping 通，说明 WiFi 已经完全正常工作。

---

# 🛠 6. 设置 WiFi 开机自动连接（systemd）

启用系统服务：

```bash
sudo systemctl enable --now wpa_supplicant@wlp195s0.service
```

检查状态：

```bash
systemctl status wpa_supplicant@wlp195s0
```

应显示：

```
active (running)
```

重启验证：

```bash
sudo reboot
```

重新登录后：

```bash
ip addr show wlp195s0
ping -c 3 8.8.8.8
```

WiFi 依然在线 → 配置成功。

---

# 🧩 Troubleshooting（故障排查）

### ❗ `dhclient: command not found`

Ubuntu Server 24.04 ​**不再使用 dhclient**​。
属于正常现象，可忽略。

---

### ❗ Unsupported driver 'nl80211'

这是 wpa\_supplicant 的非致命警告，WiFi 实际仍可正常工作。

---

### ❗ WiFi 处于 DORMANT / no IP

wpa\_supplicant 未启动，运行：

```bash
sudo systemctl restart wpa_supplicant@wlp195s0
```

---

# 📜 License

你可以自由使用、修改、转载本教程内容。
适用于 GitHub、博客、B站专栏和技术分享用途。

---

# 🙌 Acknowledgements

本教程根据真实调试流程编写
并在 **MS-S1 MAX + Ubuntu Server 24.04 + MT7925** 设备上实测可用。

```

```
