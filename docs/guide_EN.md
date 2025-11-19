---
title: MS-S1 MAX Ubuntu Server 24.04 Offline WiFi Configuration Guide (MT7925 Verified)
---

# MS-S1 MAX Ubuntu Server 24.04 Offline WiFi Configuration Guide (MT7925 Verified)

> A fully verified guide for enabling WiFi on **Ubuntu Server 24.04** (and 20.04/22.04),  
> especially when installed **offline** and using **wpa_supplicant + netplan**.  
>  
> This tutorial is **validated on real hardware using MediaTek MT7925 wireless chipset** and supports Intel/Realtek devices as well.

---
## ✨ Features

- ✔ Works on fully offline installations  
- ✔ Verified on MT7925 (`mt7925e`) WiFi chipset  
- ✔ No NetworkManager required  
- ✔ Only uses `netplan` + `wpa_supplicant`  
- ✔ Supports auto-connect on reboot  
- ✔ Clean YAML + systemd service  
- ✔ Professional-grade steps suitable for production servers  

---

## 📦 Tested Environment

| Item | Version / Model |
|------|-----------------|
| OS | Ubuntu Server 24.04 LTS |
| Kernel | 6.8+ |
| WiFi Chipset | MediaTek MT7925 |
| Driver | mt7925e |
| Tools | netplan + systemd-networkd + wpa_supplicant |
| Network | WPA2-PSK |
| Installation | Offline installation |

---

## 🛠 1. Check Wireless Interface & Driver

List network interfaces:

```bash
ip link show
````

Typical result:

```
2: wlp195s0: <BROADCAST,MULTICAST>
```

Check MT7925 driver:

```bash
lsmod | grep mt7925
```

Expected:

```
mt7925e
mt7925_common
mt792x_lib
```

Load driver manually (if needed):

```bash
sudo modprobe mt7925e
```

---

## 🛠 2. Create `wpa_supplicant` Config (WiFi authentication)

Create directory:

```bash
sudo mkdir -p /etc/wpa_supplicant
```

Create configuration file:

```bash
sudo nano /etc/wpa_supplicant/wpa_supplicant-wlp195s0.conf
```

Paste:

```ini
ctrl_interface=DIR=/run/wpa_supplicant GROUP=netdev
update_config=1
country=CN

network={
    ssid="Your WiFi SSID"
    psk="Your WiFi password"
}
```

Save and exit.

---

## 🛠 3. Create Netplan Configuration

Create file:

```bash
sudo nano /etc/netplan/01-wifi.yaml
```

Paste this **correctly indented** YAML:

```yaml
network:
  version: 2
  renderer: networkd
  wifis:
    wlp195s0:
      dhcp4: true
      access-points:
        "Your WiFi SSID":
          password: "Your WiFi password"
      optional: true
```

Set recommended permissions:

```bash
sudo chmod 600 /etc/netplan/01-wifi.yaml
```

Apply:

```bash
sudo netplan generate
sudo netplan apply
```

---

## 🛠 4. Start WiFi via `wpa_supplicant`

Check location:

```bash
which wpa_supplicant
```

Run (update path if needed):

```bash
sudo wpa_supplicant -i wlp195s0 \
  -c /etc/wpa_supplicant/wpa_supplicant-wlp195s0.conf \
  -D nl80211 -B
```

Expected:

```
Successfully initialized wpa_supplicant
```

---

## 🛠 5. Verify IP Assignment (DHCP)

Ubuntu Server 24.04 uses systemd-networkd DHCP by default
(no need for `dhclient`).

Check:

```bash
ip addr show wlp195s0
```

Example (successful):

```
inet 10.17.38.96/23 scope global dynamic wlp195s0
```

Test network:

```bash
ping -c 3 8.8.8.8
```

---

## 🛠 6. Enable Auto-Connect on Boot (systemd)

```bash
sudo systemctl enable --now wpa_supplicant@wlp195s0.service
```

Verify:

```bash
systemctl status wpa_supplicant@wlp195s0
```

Should show:

```
active (running)
```

Reboot and test:

```bash
sudo reboot
```

After reboot:

```bash
ip addr show wlp195s0
ping -c 3 8.8.8.8
```
Done