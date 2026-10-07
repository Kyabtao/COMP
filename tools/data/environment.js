"use strict";
/** Environment and ecology extras. */

/** [international agreement / organisation, purpose] */
const ENV_AGREEMENTS = [
  ["Montreal Protocol", "Phasing out ozone depleting substances"],
  ["Kyoto Protocol", "Reduction of greenhouse gas emissions by developed countries"],
  ["Paris Agreement", "Limiting global temperature rise to well below two degrees Celsius"],
  ["Ramsar Convention", "Conservation and wise use of wetlands"],
  ["Basel Convention", "Control of transboundary movement of hazardous waste"],
  ["Stockholm Convention", "Elimination of persistent organic pollutants"],
  ["Minamata Convention", "Control of mercury emissions"],
  ["Convention on Biological Diversity", "Conservation of biological diversity"],
  ["CITES", "Control of international trade in endangered species"],
  ["UN Framework Convention on Climate Change", "Framework for climate action"],
  ["Nagoya Protocol", "Access and benefit sharing of genetic resources"],
  ["Cartagena Protocol", "Biosafety of living modified organisms"],
  ["Kigali Amendment", "Phase down of hydrofluorocarbons"],
  ["Sendai Framework", "Disaster risk reduction"],
  ["Vienna Convention", "Protection of the ozone layer"],
  ["Ramsar Montreux Record", "Wetlands facing ecological change"],
  ["International Solar Alliance", "Cooperation on solar energy"],
  ["Global Tiger Initiative", "Conservation of wild tigers"],
  ["UN Decade on Ecosystem Restoration", "Restoring degraded ecosystems"],
  ["Sustainable Development Goals", "Seventeen goals for people and planet by 2030"]
];

/** [pollutant, effect / source] */
const POLLUTION = [
  ["Carbon monoxide", "Reduces oxygen carrying capacity of blood"],
  ["Sulphur dioxide", "Causes acid rain"],
  ["Nitrogen oxides", "Cause acid rain and smog"],
  ["Carbon dioxide", "Traps heat and causes global warming"],
  ["Methane", "Potent greenhouse gas from livestock and paddy fields"],
  ["Chlorofluorocarbons", "Destroy the ozone layer"],
  ["Lead", "Damages the nervous system"],
  ["Mercury", "Bioaccumulates and damages the brain"],
  ["Arsenic", "Causes skin lesions and cancer in groundwater"],
  ["Fluoride", "Causes fluorosis in excess"],
  ["Particulate matter PM 2.5", "Fine particles that reach deep into the lungs"],
  ["Plastic waste", "Persists in the environment for centuries"],
  ["Oil spills", "Damage marine life and coastlines"],
  ["Noise above 85 decibels", "Causes hearing loss"],
  ["Nitrate from fertilisers", "Causes eutrophication of water bodies"],
  ["Phosphate detergents", "Cause algal blooms in water"],
  ["Radioactive waste", "Causes genetic damage and cancer"],
  ["Thermal discharge from power plants", "Raises water temperature and harms aquatic life"],
  ["Fly ash from thermal plants", "Air pollution with fine particulate matter"],
  ["Electronic waste", "Releases heavy metals when dumped improperly"]
];

/** [biosphere reserve / wetland, state] */
const BIOSPHERE = [
  ["Nilgiri Biosphere Reserve", "Tamil Nadu, Kerala and Karnataka"],
  ["Nanda Devi Biosphere Reserve", "Uttarakhand"],
  ["Gulf of Mannar Biosphere Reserve", "Tamil Nadu"],
  ["Sundarbans Biosphere Reserve", "West Bengal"],
  ["Simlipal Biosphere Reserve", "Odisha"],
  ["Pachmarhi Biosphere Reserve", "Madhya Pradesh"],
  ["Achanakmar Amarkantak Biosphere Reserve", "Madhya Pradesh and Chhattisgarh"],
  ["Great Nicobar Biosphere Reserve", "Andaman and Nicobar Islands"],
  ["Agasthyamalai Biosphere Reserve", "Kerala and Tamil Nadu"],
  ["Kanchenjunga Biosphere Reserve", "Sikkim"],
  ["Cold Desert Biosphere Reserve", "Himachal Pradesh"],
  ["Seshachalam Biosphere Reserve", "Andhra Pradesh"],
  ["Panna Biosphere Reserve", "Madhya Pradesh"],
  ["Chilika Lake", "Odisha"],
  ["Keoladeo Ghana", "Rajasthan"],
  ["Wular Lake", "Jammu and Kashmir"],
  ["Loktak Lake", "Manipur"],
  ["Sambhar Lake", "Rajasthan"],
  ["Point Calimere", "Tamil Nadu"],
  ["Deepor Beel", "Assam"]
];

/** [Indian environmental scheme or law, purpose] */
const ENV_SCHEMES = [
  ["Wildlife Protection Act 1972", "Protection of wild animals and plants"],
  ["Water Act 1974", "Prevention of water pollution"],
  ["Air Act 1981", "Prevention of air pollution"],
  ["Environment Protection Act 1986", "Umbrella law for environmental protection"],
  ["Forest Conservation Act 1980", "Control of diversion of forest land"],
  ["Biological Diversity Act 2002", "Conservation of biological diversity"],
  ["National Green Tribunal", "Adjudication of environmental disputes"],
  ["Project Tiger", "Conservation of tigers"],
  ["Project Elephant", "Conservation of elephants"],
  ["Project Cheetah", "Reintroduction of cheetahs"],
  ["National Action Plan on Climate Change", "Eight missions on climate change"],
  ["Swachh Bharat Mission", "Cleanliness and sanitation"],
  ["Namami Gange", "Cleaning the Ganga"],
  ["National Clean Air Programme", "Reduction of air pollution in cities"],
  ["Compensatory Afforestation Fund", "Funds for afforestation in lieu of diverted forest"],
  ["Eco Sensitive Zone notification", "Protection of ecologically fragile areas"]
];

module.exports = { ENV_AGREEMENTS, POLLUTION, BIOSPHERE, ENV_SCHEMES };
