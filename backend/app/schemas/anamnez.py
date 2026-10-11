from __future__ import annotations
from pydantic import BaseModel


class PatientInfo(BaseModel):
    hasta_adi: str = ""
    hasta_sahibi: str = ""
    protokol_no: str = ""
    tur: str = ""
    irk: str = ""
    cinsiyet: str = ""
    yas: str = ""
    kilo: str = ""
    hastalik_suresi: str = ""
    mama_tuketimi: str = ""      # Kuru mama / Yaş mama / Ev yemeği
    mama_markasi: str = ""
    su_tuketimi: str = ""        # Az / Normal / Fazla
    anne_sutu: str = ""          # Aldı / Almadı
    seyahat: str = ""            # Var / Yok
    sigara_iceride: str = ""     # Evet / Hayır


class AsiDurumu(BaseModel):
    ic_parazit: bool = False
    dis_parazit: bool = False
    karma: bool = False
    kuduz: bool = False
    losemi: bool = False
    lyme: bool = False
    bronsin: bool = False
    corona: bool = False


class SistemBulgulari(BaseModel):
    # Sindirim
    anoreksi: bool = False
    polifaji: bool = False
    polidipsi: bool = False
    pityalizm: bool = False
    disfaji: bool = False
    regurgitasyon: bool = False
    kusma: bool = False
    hematemez: bool = False
    diyare: bool = False
    konstipasyon: bool = False
    dishezi: bool = False
    hematokezi: bool = False
    melena: bool = False
    tenesmus: bool = False
    # Solunum
    sigara_solunumu: bool = False
    rinore: bool = False
    epistaksis: bool = False
    ekspektorasyon: bool = False
    oksuruk: bool = False
    gece_oksurugu: bool = False
    egzersiz_intoleransi: bool = False
    dispne: bool = False
    ortopne: bool = False
    periferal_odem: bool = False
    # İdrar
    disuri: bool = False
    stranguri: bool = False
    hematuri: bool = False
    anuri: bool = False
    oligouri: bool = False
    polyuri: bool = False
    pollakiuri: bool = False
    hemoglobinuri: bool = False
    myoglobinuri: bool = False
    senkop: bool = False
    # Nörolojik
    tremor: bool = False
    ataksi: bool = False
    opistotonus: bool = False
    myoklonus: bool = False
    parapleji: bool = False
    hemipleji: bool = False
    tetrapleji: bool = False
    konvulsiyon: bool = False


class FizikselMuayene(BaseModel):
    genel_durum: str = ""
    goz_muayenesi: str = ""
    gozler_orbitaya_cokme: str = ""
    mukoza_rengi: str = ""
    mukoza_nemliligi: str = ""
    crt: str = ""
    deri_turgoru: str = ""
    dehidrasyon: str = ""
    lenf_nodulleri: str = ""
    batin_palpasyonu: str = ""
    periferal_sicaklik: str = ""
    kardiyak_oskultasyon: str = ""
    pulmoner_oskultasyon: str = ""


class VitalBulgular(BaseModel):
    vucut_sicakligi: str = ""
    nabiz: str = ""
    solunum_sayisi: str = ""
    tansiyon: str = ""


class AnamnezRequest(BaseModel):
    hasta: PatientInfo
    asi: AsiDurumu = AsiDurumu()
    sikayet: str = ""
    sistem: SistemBulgulari
    fiziksel: FizikselMuayene
    vital: VitalBulgular
    tedavi_gecmisi: str = ""


class AnamnezAnalysisResponse(BaseModel):
    halk_dili: str
    hekim_dili: str
    onerilen_tetkikler: str
    uyari: str
