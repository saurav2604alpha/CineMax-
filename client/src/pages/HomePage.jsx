import HeroBanner from "../components/homepage/HeroBanner";
import { NowShowingSection, ComingSoonSection } from "../components/homepage/Sections";

const HomePage = () => (
  <div className="bg-gray-950">
    <HeroBanner />
    <NowShowingSection />
    <ComingSoonSection />
  </div>
);

export default HomePage;
