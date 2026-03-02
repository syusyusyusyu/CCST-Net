## 概要

ネットワークのトラブルシューティングでは、コマンドラインから実行できる診断コマンドが非常に重要です。ping、ipconfig/ifconfig/ip、tracert/traceroute、nslookup の 4 つの基本コマンドを使いこなすことで、ネットワークの接続性、設定、経路、名前解決の問題を効率的に特定できます。CCST 試験では、各コマンドの用途と出力結果の解釈が問われます。

## ping コマンド

<KeyTerm term="ping" reading="ピング">ICMP Echo Request パケットを宛先に送信し、Echo Reply パケットが返ってくるかを確認することで、ネットワークの接続性をテストするコマンドです。すべての OS で使用可能な最も基本的な診断ツールです。</KeyTerm>

ping コマンドは、ネットワークトラブルシューティングで最初に使用するコマンドです。宛先との通信が可能かどうかを簡単に確認できます。

**基本的な使い方:**

```
ping 192.168.1.1          (IP アドレスを指定)
ping www.example.com       (ドメイン名を指定)
```

**出力結果の読み方:**

```
Reply from 192.168.1.1: bytes=32 time=1ms TTL=64
Reply from 192.168.1.1: bytes=32 time=2ms TTL=64
Reply from 192.168.1.1: bytes=32 time=1ms TTL=64
Reply from 192.168.1.1: bytes=32 time=1ms TTL=64

Ping statistics:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)
Approximate round trip times:
    Minimum = 1ms, Maximum = 2ms, Average = 1ms
```

| 項目 | 説明 |
|---|---|
| bytes | 送受信データのサイズ |
| time | パケットの往復にかかった時間（ラウンドトリップタイム） |
| TTL | Time To Live。パケットが通過できるルーターの最大数 |
| Packets Lost | 失われたパケットの数と割合 |

**ping の結果が返ってこない場合の原因:**

- 宛先デバイスがダウンしている
- ネットワーク経路に問題がある（ケーブル断線、ルーティング設定ミスなど）
- ファイアウォールが ICMP パケットをブロックしている
- IP アドレスやデフォルトゲートウェイの設定が間違っている

<KeyPoint>
- ping は ICMP を使用してネットワーク接続性を確認する最も基本的なコマンド
- 応答時間（time）でネットワークの遅延を確認できる
- パケットロスが発生している場合はネットワークの品質に問題がある
- ping が失敗してもファイアウォールでブロックされている可能性がある
</KeyPoint>

**トラブルシューティングの ping 手順:**

ネットワーク接続の問題を切り分けるために、以下の順番で ping を実行します。

1. `ping 127.0.0.1`（ループバック）: 自分自身の TCP/IP スタックが正常か確認
2. `ping [自分の IP アドレス]`: 自分の NIC が正常か確認
3. `ping [デフォルトゲートウェイ]`: ローカルネットワーク内の接続性を確認
4. `ping [リモートの IP アドレス]`: リモートネットワークへの接続性を確認
5. `ping [ドメイン名]`: DNS による名前解決が正常か確認

この順番で実行することで、問題がどの層（レイヤー）にあるかを段階的に絞り込めます。

## ipconfig / ifconfig / ip コマンド

これらのコマンドは、デバイスのネットワーク設定を確認するために使用します。OS によって使用するコマンドが異なります。

### Windows: ipconfig

<KeyTerm term="ipconfig" reading="アイピーコンフィグ">Windows で使用するネットワーク設定確認コマンドです。IP アドレス、サブネットマスク、デフォルトゲートウェイなどの情報を表示します。</KeyTerm>

**よく使うオプション:**

| コマンド | 説明 |
|---|---|
| `ipconfig` | 基本的な IP 設定を表示 |
| `ipconfig /all` | 詳細な設定を表示（MAC アドレス、DHCP サーバー、DNS サーバーなど） |
| `ipconfig /release` | DHCP リースを解放（IP アドレスを返却） |
| `ipconfig /renew` | DHCP リースを更新（新しい IP アドレスを取得） |
| `ipconfig /flushdns` | DNS キャッシュをクリア |
| `ipconfig /displaydns` | DNS キャッシュの内容を表示 |

`ipconfig /release` → `ipconfig /renew` の順で実行することで、IP アドレスの再取得が可能です。DHCP 関連の問題を解決する際に使用します。

### Linux: ip コマンド（推奨）/ ifconfig（レガシー）

<KeyTerm term="ip command" reading="アイピーコマンド">Linux で使用するネットワーク設定確認・変更コマンドです。従来の ifconfig に代わる新しいコマンドで、より多くの機能を提供します。</KeyTerm>

| コマンド | 説明 |
|---|---|
| `ip addr show` (または `ip a`) | IP アドレスの表示 |
| `ip route show` | ルーティングテーブルの表示 |
| `ip link show` | インターフェースの状態を表示 |
| `ifconfig` | IP アドレスの表示（レガシー） |

### macOS: ifconfig

macOS では `ifconfig` コマンドを使用します。`ip` コマンドは macOS には標準でインストールされていません。

<KeyPoint>
- Windows: `ipconfig`（特に `/all` オプションで詳細表示）
- Linux: `ip addr show` が推奨、`ifconfig` はレガシー
- macOS: `ifconfig` を使用
- `ipconfig /release` → `/renew` で DHCP の IP アドレスを再取得できる
</KeyPoint>

## tracert / traceroute コマンド

<KeyTerm term="tracert / traceroute" reading="トレースルート">送信元から宛先までの経路上にあるルーター（ホップ）を一覧表示するコマンドです。各ホップでの応答時間も表示されるため、経路上のどこで遅延や障害が発生しているかを特定できます。</KeyTerm>

**使い方:**

```
tracert 8.8.8.8            (Windows)
traceroute 8.8.8.8         (Linux / macOS)
```

**出力例:**

```
  1    1 ms    1 ms    1 ms  192.168.1.1
  2   10 ms   11 ms   10 ms  203.0.113.1
  3   15 ms   14 ms   15 ms  198.51.100.1
  4    *       *       *     Request timed out.
  5   20 ms   21 ms   20 ms  8.8.8.8
```

| 列 | 説明 |
|---|---|
| 1, 2, 3... | ホップ番号（経由するルーターの順番） |
| ms の 3 列 | 各ホップへの応答時間（3 回の計測結果） |
| IP アドレス | 経由するルーターの IP アドレス |
| `* * *` | 応答がないホップ（ファイアウォールでブロックされている場合など） |

tracert は TTL（Time To Live）の値を 1 から順に増やしてパケットを送信し、各ルーターから返される ICMP Time Exceeded メッセージを利用して経路を特定します。Windows の tracert は ICMP を使用し、Linux/macOS の traceroute はデフォルトで UDP を使用します。

<KeyPoint>
- tracert/traceroute は宛先までの経路（ホップ）と各ホップの応答時間を表示する
- Windows では `tracert`、Linux/macOS では `traceroute` を使用する
- `* * *` の表示はファイアウォールによるブロックの可能性がある
- 特定のホップで応答時間が急増する場合、そのホップに問題がある可能性がある
</KeyPoint>

## nslookup コマンド

<KeyTerm term="nslookup" reading="エヌエスルックアップ">DNS（Domain Name System）の名前解決を手動でテストするコマンドです。ドメイン名から IP アドレスへの変換（正引き）や、IP アドレスからドメイン名への変換（逆引き）を確認できます。</KeyTerm>

**基本的な使い方:**

```
nslookup www.example.com              (正引き: ドメイン名 → IP アドレス)
nslookup 93.184.216.34                (逆引き: IP アドレス → ドメイン名)
nslookup www.example.com 8.8.8.8      (特定の DNS サーバーを指定して問い合わせ)
```

**出力例:**

```
Server:  dns.example.com
Address:  192.168.1.1

Non-authoritative answer:
Name:    www.example.com
Address:  93.184.216.34
```

| 項目 | 説明 |
|---|---|
| Server | 問い合わせに使用した DNS サーバー |
| Non-authoritative answer | キャッシュされた回答（権威サーバーからの直接回答ではない） |
| Name | 問い合わせたドメイン名 |
| Address | 解決された IP アドレス |

nslookup で名前解決に失敗する場合は、DNS サーバーの設定が正しいか、DNS サーバーが稼働しているかを確認します。`ping` で IP アドレス指定では成功するがドメイン名では失敗する場合は、DNS の問題である可能性が高いです。

## まとめ

- `ping`: ネットワーク接続性の基本確認。ICMP を使用し、応答時間とパケットロスを確認できます
- `ipconfig`（Windows）/ `ip addr show`（Linux）/ `ifconfig`（macOS）: デバイスの IP アドレスやネットワーク設定を確認します
- `tracert`（Windows）/ `traceroute`（Linux/macOS）: 宛先までの経路と各ホップの応答時間を確認します
- `nslookup`: DNS の名前解決が正しく行われているかをテストします
- これらのコマンドを組み合わせることで、ネットワーク問題の原因を体系的に特定できます
