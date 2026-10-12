# Hakan Karateke · Portfolio

Türkçe ve İngilizce, kuantum estetiğinden ilham alan kişisel portföy. Tamamen statik; veritabanı, sunucu uygulaması, hesap sistemi veya analiz servisi içermez. GitHub Pages kullanıcı sitesi olarak hazırlanmıştır.

**Site:** https://hakan-karateke.github.io
**Depo:** `Hakan-karateke/Hakan-karateke.github.io`

## Geliştirme

Node.js 20 veya üzeri yeterlidir. Paket kurulumu gerekmez.

```sh
npm run build
npm test
npm run dev
```

Yerel adres: `http://127.0.0.1:4173`. `data/` içeriği ve `assets/` kaynakları `scripts/build.mjs` ile `docs/` içine derlenir. `docs/` yayımlanacak, Git'te tutulan çıktıdır. Kaynak değişikliklerinden sonra yeniden build alın ve çıktıyı commit'e ekleyin.

## İçerik düzenleme

| Dosya | İçerik |
| --- | --- |
| `data/profile.json` | Profil, sosyal bağlantılar, projeler, sertifikalar |
| `data/translations.json` | Türkçe ve İngilizce arayüz ve biyografi |
| `data/privacy.json` | Mevcut yayımlanmış uygulama gizlilik politikaları |
| `data/terms.json` | Yeni kullanım koşulu taslakları ve veri silme bilgisi |
| `assets/style.css` | Responsive tasarım |
| `assets/app.js` | Filtreler, mobil menü ve durdurulabilir kuantum görseli |
| `assets/quantum.js` | WebGL parçacık sahnesi, halka/küre/sarmal dönüşümleri ve Canvas yedeği |
| `assets/experience.css` | Ana sayfanın 3B katmanları, kartlar, bölüm göstergesi ve kaydırma geçişleri |
| `assets/language.js` | Tarayıcı dili ve elle seçilen dil |

`/tr/` ve `/en/` kalıcı, önceden oluşturulmuş sayfalardır. Dilsiz adresler, varsa kaydedilmiş tercihe, yoksa tarayıcının **birincil** diline göre yönlenir. Türkçe dışındaki diller İngilizceye düşer. Dil tercihi yalnızca `localStorage` içinde `hk-language` anahtarıyla saklanır. Depolama veya JavaScript kapalıysa içerik ve dil bağlantıları kullanılabilir. Arayüzdeki kuantum alanı dekoratif bir parçacık görselidir, bilimsel simülasyon değildir.

## GitHub Pages

Repository → Settings → Pages → Deploy from a branch → **main /docs**.

Bu repo bir kullanıcı sitesidir; `/assets/` gibi kökten başlayan yollar bilinçli kullanılır. Farklı isimde bir proje deposu altında yayımlamak için yolların taban dizini uyarlanmalıdır. GitHub kullanıcı adındaki tire alan adında da bulunur. Özel alan adı gerekmemektedir.

## Uygulamalar için kalıcı adresler

| Uygulama | Gizlilik | Kullanım koşulları |
| --- | --- | --- |
| Yansı | `/apps/yansi/privacy/` | `/apps/yansi/terms/` |
| Cep Sözlüğüm | `/apps/cep-sozlugum/privacy/` | `/apps/cep-sozlugum/terms/` |

Her adresin `/tr` ve `/en` önekli dil sabit sürümleri de vardır. Cep Sözlüğüm hesap silme bilgisi: `/apps/cep-sozlugum/delete-account/`.

### Yayın ve sözleşme durumu

- Gizlilik politikaları geliştiricinin mevcut Google Sites yayınlarından içerikleri korunarak taşındı. Son güncelleme tarihleri Yansı için 4 Ekim 2026, Cep Sözlüğüm için 7 Ekim 2026 olarak korundu. Kaynak bağlantısı sayfalarda bulunur.
- Önceden yayımlanmış uygulamaya özel kullanım koşulu bulunamadı. Yeni hazırlanan kullanım koşulları **inceleme taslağıdır, henüz yürürlükte değildir**. Geliştirici, koşulları ürün davranışı ve uygulanabilir hukuk açısından incelemeli; uygulamalarında yürürlüğe alacağı sürüm için taslak notunu, kapsam metnini ve yürürlük tarihini güncellemelidir. Metinlerin hukuki yeterliliğine dair garanti verilmez.
- Cep Sözlüğüm'ün 11 Ekim 2026'da incelenen Google Play Veri Güvenliği özeti veri toplanmadığını söylerken ayrıntılı mevcut gizlilik politikası Firebase Authentication, Firestore, Analytics, Crashlytics ve reklam kimliği kullanımını açıklıyor. Uygulama adreslerini değiştirmeden önce bu mevcut çelişki geliştirici tarafından giderilmelidir. Bu görevde uygulamalara veya mağaza kayıtlarına değişiklik yapılmamıştır.
- Veri silme sayfası mevcut politikanın e-posta ile talep ve 30 günlük süre bilgisini yansıtır; talep göndermez, Firebase'e bağlanmaz. Uygulama içindeki hesap silme işlevinin varlığı bu site tarafından doğrulanmış değildir.
- CV PDF'lerinin tamamı yayımlanmadı; portföyde mesleki özet, eğitim ve bağımsız çalışmalar kullanıldı.

## İçerik kaynakları

- Kullanıcı tarafından sağlanan Türkçe / İngilizce CV'ler ve LinkedIn HTML dışa aktarımı.
- [GitHub](https://github.com/Hakan-karateke), [LinkedIn](https://www.linkedin.com/in/hakankarateke/).
- [Yansı](https://play.google.com/store/apps/details?id=com.hakankarateke.yansi), [Cep Sözlüğüm](https://play.google.com/store/apps/details?id=com.hakankarateke.ingilizcecepsozlugum): uygulama açıklamaları, simgeler ve ekran görüntüleri.
- [ViT seminer çalışması](https://github.com/Hakan-karateke/lung-focused-vit-cxr), [Hasta kayıt sistemi](https://github.com/Hakan-karateke/Patient-Registration-and-Examination-System).
- [IEEE Access yayını](https://ieeexplore.ieee.org/document/11513754/), DOI `10.1109/ACCESS.2026.3691986`.
- [Yansı mevcut politika](https://sites.google.com/view/yansigame), [Cep Sözlüğüm mevcut politika](https://sites.google.com/view/ingilizcecepsozlugum/ana-sayfa).
- [Google Play kullanıcı verisi politikası](https://support.google.com/googleplay/android-developer/answer/10144311), [GitHub gizlilik bildirimi](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

Space Grotesk fontu yerel sunulur; SIL Open Font License lisansı `assets/fonts/OFL.txt` içindedir. Uygulama görselleri geliştiricinin herkese açık mağaza yayınlarından alınmıştır. Araştırma notları ve ham kaynaklar `.research/` altında yerel tutulur, Git'e eklenmez.

## Hareket ve erişilebilirlik

Ana sayfadaki `QuantumScene`, kaydırma ilerledikçe halka, küre ve çift sarmal arasında dönüşür. WebGL kullanılamıyorsa daha hafif Canvas çizimine geçer. Telefonlarda parçacık sayısı azaltılır; piksel yoğunluğu sınırlıdır. Sekme görünür değilken animasyon döngüsü durur. Sağ alttaki kontrol hareketi durdurur; sistemde `prefers-reduced-motion` açık olduğunda sahne statik, içerik geçişsiz gösterilir. Doğal kaydırma davranışı değiştirilmez. Sözleşme sayfalarına 3B sahne eklenmez.
