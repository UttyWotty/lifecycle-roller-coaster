/**
 * Turkish names and titles for ride lenses: parts of life, decades, ages, and life before or after an age.
 * It must give every key the English file gives, which the message index checks when it is compiled.
 * Number lenses use the Back form after a number whose last vowel is a, ı, o or u (1990'lar) and the Front form
 * otherwise (2020'ler), following Turkish vowel harmony.
 */
import type { lenses as english } from "../en/lenses";

export const lenses: Record<keyof typeof english, string> = {
  careerName: "Kariyer",
  careerTitle: "Kariyer Trenim",
  businessName: "İş",
  businessTitle: "Girişimcilik Yolculuğum",
  relationshipsName: "İlişkiler",
  relationshipsTitle: "İlişki Trenim",
  educationName: "Okul",
  educationTitle: "Okul Yıllarım",
  financeName: "Para",
  financeTitle: "Para Trenim",
  healthName: "Sağlık",
  healthTitle: "Sağlık Yolculuğum",
  personalName: "Kişisel",
  personalTitle: "Kişisel Yolculuğum",
  decadeNameBack: "{decade}'lar",
  decadeNameFront: "{decade}'ler",
  decadeTitleBack: "{decade}'larım",
  decadeTitleFront: "{decade}'lerim",
  teensName: "Gençliğim",
  teensTitle: "Gençlik Trenim",
  ageNameBack: "{age}'larım",
  ageNameFront: "{age}'lerim",
  ageTitleBack: "{age}'larımın Treni",
  ageTitleFront: "{age}'lerimin Treni",
  beforeName: "{age} yaş öncesi",
  beforeTitle: "{age} Yaş Öncesi Hayatım",
  afterName: "{age} yaş sonrası",
  afterTitle: "{age} Yaş Sonrası Hayatım",
};
