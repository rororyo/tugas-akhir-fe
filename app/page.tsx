'use client';
import { Header } from '@/components/layout/Header';
import { useDetection } from '@/hooks/useDetection';
import { HeroSection } from '@/components/sections/hero/HeroSection';
import { AboutSection } from '@/components/sections/about/AboutSection';
import { DetectionSection } from '@/components/sections/detection/DetectionSection';
import { ResultsSection } from '@/components/sections/result/ResultSection';
import { ContributorSection } from '@/components/sections/contributors/ContributorsSection';

export default function HomePage() {
  const detection = useDetection();

  const scrollTo = (id: string, offset = 88) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.pageYOffset - offset,
        behavior: 'smooth',
      });
    }
  };

  const handleDetection = async () => {
    try {
      await detection.handleDetection();
      setTimeout(() => scrollTo('results'), 100);
    } catch (error) {
      console.error('Detection failed:', error);
    }
  };

  const handleReset = () => {
    detection.resetDetection();
    setTimeout(() => scrollTo('detection'), 100);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header />
      <HeroSection />
      <AboutSection />
      <DetectionSection
        inputMethod={detection.inputMethod}
        setInputMethod={detection.setInputMethod}
        selectedFeatures={detection.selectedFeatures}
        onFeatureToggle={detection.handleFeatureToggle}
        uploadedFile={detection.uploadedFile}
        parsedData={detection.parsedData}
        onFileUpload={detection.handleFileUpload}
        formData={detection.formData}
        onFormChange={detection.handleFormChange}
        onDetection={handleDetection}
        onDownloadTemplate={detection.downloadTemplate}
        isLoading={detection.isLoading}
      />

      {detection.results && (
        <ResultsSection
          results={detection.results}
          inputMethod={detection.inputMethod}
          onDownload={detection.downloadResults}
          onReset={handleReset}
        />
      )}

      <ContributorSection />
    </div>
  );
}
