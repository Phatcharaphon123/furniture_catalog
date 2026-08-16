import React from "react";
import Hero from "../components/Hero";
import CategorySection from "../components/CategorySection";
import ProductSection from "../components/ProductSection";
import ProjectSection from "../components/ProjectSection";
import HowToOrder from "../components/HowToOrder";
import ContactSection from "../components/ContactSection";
import Question from "../components/Question";

export default function ShopPage() {
  return (
    <main>
      <Hero />
      <CategorySection />
      <ProductSection />
      <ProjectSection />
      <HowToOrder />
      <Question />
      <ContactSection />
    </main>
  );
}