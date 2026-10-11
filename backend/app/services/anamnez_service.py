from __future__ import annotations
from app.schemas.anamnez import AnamnezRequest, AnamnezAnalysisResponse
from app.core.config import settings


def _build_prompt(req: AnamnezRequest) -> str:
    h = req.hasta
    a = req.asi
    s = req.sistem
    f = req.fiziksel
    v = req.vital

    # Pozitif belirtiler
    sistem_pozitif = [
        k.replace("_", " ") for k, val in s.model_dump().items() if val is True
    ]

    # Aşı durumu
    asi_pozitif = [k.replace("_", " ") for k, val in a.model_dump().items() if val is True]

    prompt = f"""Sen deneyimli bir veteriner hekimsin. Aşağıdaki hasta bilgilerini ve klinik bulgularını değerlendirerek iki ayrı analiz yaz.

## HASTA BİLGİLERİ
- Adı: {h.hasta_adi or "Belirtilmedi"}
- Sahibi: {h.hasta_sahibi or "Belirtilmedi"}
- Protokol No: {h.protokol_no or "Belirtilmedi"}
- Tür: {h.tur or "Belirtilmedi"} | Irk: {h.irk or "Belirtilmedi"}
- Cinsiyet: {h.cinsiyet or "Belirtilmedi"} | Yaş: {h.yas or "?"} | Kilo: {h.kilo or "?"} kg
- Hastalık Süresi: {h.hastalik_suresi or "Belirtilmedi"}
- Mama: {h.mama_tuketimi or "Belirtilmedi"}{f" ({h.mama_markasi})" if h.mama_markasi else ""} | Su Tüketimi: {h.su_tuketimi or "Belirtilmedi"}
- Anne Sütü: {h.anne_sutu or "Belirtilmedi"} | Seyahat: {h.seyahat or "Belirtilmedi"} | Yanında Sigara: {h.sigara_iceride or "Belirtilmedi"}
- Aşı Durumu: {", ".join(asi_pozitif) if asi_pozitif else "Belirtilmedi"}

## ŞEKAYET
{req.sikayet or "Belirtilmedi"}

## SİSTEM BULGULARI (pozitif olanlar)
{", ".join(sistem_pozitif) if sistem_pozitif else "Belirti işaretlenmedi"}

## FİZİKSEL MUAYENE
- Genel durum: {f.genel_durum or "?"}
- Mukoza rengi: {f.mukoza_rengi or "?"} | Nem: {f.mukoza_nemliligi or "?"}
- CRT: {f.crt or "?"} sn | Dehidrasyon: {f.dehidrasyon or "?"}%
- Kardiyak oskültasyon: {f.kardiyak_oskultasyon or "?"}
- Pulmoner oskültasyon: {f.pulmoner_oskultasyon or "?"}
- Batın palpasyonu: {f.batin_palpasyonu or "?"}
- Lenf nodülleri: {f.lenf_nodulleri or "?"}
- Periferal sıcaklık: {f.periferal_sicaklik or "?"}

## VİTAL BULGULAR
- Vücut sıcaklığı: {v.vucut_sicakligi or "?"} °C
- Nabız: {v.nabiz or "?"} /dk
- Solunum: {v.solunum_sayisi or "?"} /dk
- Tansiyon: {v.tansiyon or "?"}

## TEDAVİ GEÇMİŞİ
{req.tedavi_gecmisi or "Yok"}

---

Lütfen aşağıdaki JSON formatında yanıt ver (başka hiçbir şey yazma):

{{
  "halk_dili": "Hayvan sahibine sade Türkçe ile açıklama. Tıbbi terim kullanma. 3-4 cümle. Kesin teşhis verme, olası durum olarak sun.",
  "hekim_dili": "Veteriner hekime yönelik kısa diferansiyel tanı listesi ve klinik yorum. Latince/tıbbi terimler kullanabilirsin. Madde madde yaz.",
  "onerilen_tetkikler": "Bu vakada yapılması düşünülebilecek tetkikler ve görüntüleme yöntemleri. Kısa madde listesi.",
  "uyari": "Bu analiz yalnızca karar destek amaçlıdır. Kesin tanı ve tedavi sorumluluğu veteriner hekime aittir."
}}"""
    return prompt


def analyze(req: AnamnezRequest) -> AnamnezAnalysisResponse:
    import json

    api_key = settings.GEMINI_API_KEY
    if not api_key:
        # API key yoksa demo yanıt döndür
        return _demo_response(req)

    from google import genai
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-flash-lite-latest",
        contents=_build_prompt(req),
    )

    raw = response.text.strip()
    # JSON bloğunu çıkar
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()

    data = json.loads(raw)
    return AnamnezAnalysisResponse(**data)


def _demo_response(req: AnamnezRequest) -> AnamnezAnalysisResponse:
    """API key olmadan örnek yanıt (geliştirme aşaması için)"""
    s = req.sistem
    pozitif = [k for k, v in s.model_dump().items() if v is True]

    return AnamnezAnalysisResponse(
        halk_dili=(
            "Hayvanınızın belirtileri değerlendirildi. "
            "Mide-bağırsak veya genel sistem bulgularının dikkat gerektirdiği görülmektedir. "
            "Veteriner hekiminiz detaylı muayene sonrasında size daha kesin bilgi verecektir."
        ),
        hekim_dili=(
            "**Ön Diferansiyel Tanı (Demo):**\n"
            + (f"- Gastroenterit (kusma/diyare belirtileri mevcut)\n" if any(x in pozitif for x in ['kusma','diyare']) else "")
            + (f"- Böbrek yetmezliği (poliüri/oligüri/strangüri mevcut)\n" if any(x in pozitif for x in ['polyuri','oligouri','stranguri']) else "")
            + (f"- Nörolojik değerlendirme gerekli (konvülsiyon/ataksi mevcut)\n" if any(x in pozitif for x in ['konvulsiyon','ataksi','tremor']) else "")
            + "- Tam kan sayımı ve biyokimya profili önerilir.\n"
            + "\n*Not: Bu demo yanıttır. ANTHROPIC_API_KEY ayarlanınca gerçek AI analizi çalışacaktır.*"
        ),
        onerilen_tetkikler=(
            "- Tam kan sayımı (CBC)\n"
            "- Biyokimya profili (ALT, AST, BUN, kreatinin, glikoz)\n"
            "- İdrar analizi\n"
            "- Abdominal ultrasonografi\n"
            "- Dışkı parazit muayenesi"
        ),
        uyari="Bu analiz yalnızca karar destek amaçlıdır. Kesin tanı ve tedavi sorumluluğu veteriner hekime aittir."
    )
