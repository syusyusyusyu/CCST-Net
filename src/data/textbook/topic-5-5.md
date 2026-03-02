## 概要

Cisco デバイスの CLI（コマンドラインインターフェース）では、`show` コマンドを使ってデバイスの状態や設定情報を確認します。`show` コマンドは設定を変更するものではなく、現在の状態を「見る」ためのコマンドです。CCST 試験では、主要な `show` コマンドの用途と出力結果の解釈が問われるため、各コマンドの目的と出力内容をしっかり理解しておきましょう。

## show running-config

<KeyTerm term="show running-config" reading="ショウランニングコンフィグ">デバイスの RAM 上で現在動作している設定（ランニングコンフィグ）を表示するコマンドです。略記として `show run` が使えます。</KeyTerm>

このコマンドは、デバイスに現在適用されている全設定を表示します。ホスト名、インターフェースの設定、ルーティング設定、セキュリティ設定など、すべての設定項目が含まれます。

```
Router# show running-config
Building configuration...

Current configuration : 1024 bytes
!
hostname Router1
!
interface GigabitEthernet0/0
 ip address 192.168.1.1 255.255.255.0
 no shutdown
!
interface GigabitEthernet0/1
 ip address 10.0.0.1 255.255.255.0
 no shutdown
!
ip route 0.0.0.0 0.0.0.0 203.0.113.1
!
```

ランニングコンフィグは RAM に保存されているため、デバイスを再起動すると失われます。設定を永続化するには `copy running-config startup-config` コマンドで NVRAM に保存する必要があります。

<KeyPoint>
- `show running-config`（`show run`）は現在動作中の全設定を表示する
- ランニングコンフィグは RAM 上にあり、再起動で失われる
- 設定の永続化には `copy running-config startup-config` が必要
</KeyPoint>

## show version

<KeyTerm term="show version" reading="ショウバージョン">デバイスのハードウェアとソフトウェアの基本情報を表示するコマンドです。IOS のバージョン、デバイスのモデル、メモリ量、起動時間などが確認できます。</KeyTerm>

```
Router# show version
Cisco IOS Software, Version 15.4(3)M
ROM: System Bootstrap, Version 15.0
Router uptime is 5 days, 3 hours, 42 minutes
System image file is "flash:c2900-universalk9-mz.SPA.154-3.M.bin"
Cisco 2911 (revision 1.0)
512K bytes of NVRAM
256M bytes of flash memory
```

**show version で確認できる主な情報:**

| 情報 | 説明 |
|---|---|
| IOS バージョン | 動作しているソフトウェアのバージョン |
| Uptime | デバイスが最後に起動されてからの稼働時間 |
| System image file | 使用中の IOS イメージファイル名と保存場所 |
| モデル番号 | デバイスのハードウェアモデル |
| メモリ | RAM、NVRAM、フラッシュメモリの容量 |

## show ip interface brief

<KeyTerm term="show ip interface brief" reading="ショウアイピーインターフェースブリーフ">すべてのインターフェースの IP アドレスとステータスを一覧形式で簡潔に表示するコマンドです。インターフェースの状態を素早く確認する際に最も使用頻度が高いコマンドの一つです。</KeyTerm>

```
Router# show ip interface brief
Interface              IP-Address      OK? Method Status    Protocol
GigabitEthernet0/0     192.168.1.1     YES manual up        up
GigabitEthernet0/1     10.0.0.1        YES manual up        up
Serial0/0/0            unassigned      YES unset  down      down
```

| カラム | 説明 |
|---|---|
| Interface | インターフェース名 |
| IP-Address | 割り当てられた IP アドレス（未設定の場合は "unassigned"） |
| OK? | IP アドレスが有効かどうか |
| Method | IP アドレスの設定方法（manual: 手動、DHCP: 自動） |
| Status | レイヤー 1（物理層）の状態 |
| Protocol | レイヤー 2（データリンク層）の状態 |

**Status と Protocol の組み合わせと意味:**

| Status | Protocol | 意味 |
|---|---|---|
| up | up | 正常に動作中 |
| up | down | レイヤー 2 の問題（カプセル化設定のミスマッチなど） |
| down | down | 物理的な問題（ケーブル未接続、`shutdown` コマンドで無効化） |
| administratively down | down | 管理者が `shutdown` コマンドで意図的に無効化 |

<KeyPoint>
- `show ip interface brief` は全インターフェースの状態を一覧で素早く確認できる
- Status = レイヤー 1（物理層）、Protocol = レイヤー 2（データリンク層）の状態
- "administratively down" は `shutdown` コマンドで無効化されている状態
</KeyPoint>

## show ip route

<KeyTerm term="show ip route" reading="ショウアイピールート">ルーターのルーティングテーブルを表示するコマンドです。直接接続ネットワーク、スタティックルート、ダイナミックルートなど、すべての経路情報が表示されます。</KeyTerm>

```
Router# show ip route
Gateway of last resort is 203.0.113.1 to network 0.0.0.0

C    192.168.1.0/24 is directly connected, GigabitEthernet0/0
L    192.168.1.1/32 is directly connected, GigabitEthernet0/0
C    10.0.0.0/24 is directly connected, GigabitEthernet0/1
L    10.0.0.1/32 is directly connected, GigabitEthernet0/1
S*   0.0.0.0/0 [1/0] via 203.0.113.1
```

**経路のコード（先頭の文字）:**

| コード | 意味 |
|---|---|
| C | 直接接続ネットワーク（Connected） |
| L | ローカル（インターフェース自身の IP アドレス） |
| S | スタティックルート |
| S* | デフォルトルート（スタティック） |
| O | OSPF で学習した経路 |
| D | EIGRP で学習した経路 |
| R | RIP で学習した経路 |

## show cdp neighbors

<KeyTerm term="CDP" reading="シーディーピー">Cisco Discovery Protocol の略。Cisco デバイス同士が自動的に隣接デバイスの情報を交換する Cisco 独自のプロトコルです。</KeyTerm>

```
Router# show cdp neighbors
Device ID  Local Intrfce  Holdtme  Capability  Platform  Port ID
Switch1    Gig 0/0        145      S I         WS-C2960  Gig 0/1
Router2    Gig 0/1        167      R S I       C2911     Gig 0/0
```

| カラム | 説明 |
|---|---|
| Device ID | 隣接デバイスのホスト名 |
| Local Intrfce | 自分側の接続インターフェース |
| Capability | デバイスの種類（R=ルーター、S=スイッチ、I=IGMP） |
| Platform | デバイスのモデル |
| Port ID | 隣接デバイス側の接続インターフェース |

`show cdp neighbors detail` を使うと、隣接デバイスの IP アドレスや IOS バージョンなどの詳細情報も表示されます。

<KeyPoint>
- `show ip route` でルーティングテーブルの全経路を確認できる
- 経路コード（C, L, S, O, D, R）で経路の取得方法が分かる
- `show cdp neighbors` で直接接続された Cisco デバイスの情報を確認できる
</KeyPoint>

## show mac address-table

<KeyTerm term="show mac address-table" reading="ショウマックアドレステーブル">スイッチの MAC アドレステーブルを表示するコマンドです。どの MAC アドレスがどのポートに学習されているかを確認できます。</KeyTerm>

```
Switch# show mac address-table
          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type     Ports
----    -----------       ----     -----
   1    0050.7966.6800    DYNAMIC  Gi0/1
   1    00d0.ba12.3456    DYNAMIC  Gi0/2
  10    aabb.cc00.1100    STATIC   Gi0/10
```

Type が "DYNAMIC" は自動学習された MAC アドレス、"STATIC" は手動設定された MAC アドレスです。

## show interface / show interface status

**show interface [インターフェース名]:**

特定のインターフェースの詳細情報を表示します。

```
Switch# show interface GigabitEthernet0/1
GigabitEthernet0/1 is up, line protocol is up
  Hardware is Gigabit Ethernet, address is 0050.7966.6801
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec
  Input queue: 0/75/0/0 (size/max/drops/flushes)
  5 minute input rate 1000 bits/sec, 2 packets/sec
  5 minute output rate 500 bits/sec, 1 packets/sec
     1000 packets input, 64000 bytes
     500 packets output, 32000 bytes
     0 input errors, 0 CRC, 0 frame
     0 output errors, 0 collisions
```

帯域幅、入出力のトラフィック量、エラーカウンター（CRC エラー、コリジョンなど）を確認できます。エラーカウンターが増加している場合は、ケーブルの問題やデュプレックスの不一致が疑われます。

**show interface status（スイッチのみ）:**

```
Switch# show interface status
Port    Name      Status    Vlan  Duplex  Speed  Type
Gi0/1             connected 1     a-full  a-1000 10/100/1000BaseTX
Gi0/2             connected 10    a-full  a-100  10/100/1000BaseTX
Gi0/3             notconnect 1    auto    auto   10/100/1000BaseTX
```

各ポートの接続状態、VLAN 割り当て、デュプレックス、速度を一覧で確認できます。

## show inventory

```
Router# show inventory
NAME: "Chassis", DESCR: "Cisco 2911 Chassis"
PID: CISCO2911/K9, VID: V01, SN: FCZ12345678
```

デバイスのハードウェアインベントリ（モデル番号、シリアルナンバー）を表示します。資産管理や保守契約の確認に使用します。

## show switch

スタッカブルスイッチ（複数のスイッチを1台として運用できるスイッチ）のスタック構成を表示します。各スイッチのロール（Active/Standby/Member）、優先度、MAC アドレスが確認できます。

## まとめ

- `show running-config`: 現在動作中の全設定を表示する最も包括的なコマンドです
- `show ip interface brief`: 全インターフェースの IP アドレスと状態を一覧で確認できます
- `show ip route`: ルーティングテーブルを表示し、経路コードで経路の種類が分かります
- `show cdp neighbors`: 直接接続された Cisco デバイスの情報を自動検出で表示します
- `show mac address-table`: スイッチの MAC アドレスとポートの対応を確認できます
- `show interface`: インターフェースの詳細情報（トラフィック量、エラーカウンターなど）を表示します
