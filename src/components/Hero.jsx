import React from 'react';
import SplitText from './SplitText';
import ParticleField from './ParticleField';
import EyeProtractor from './EyeProtractor';
import useMagnetic from '../hooks/useMagnetic';

export default function Hero() {
  const resumeRef = useMagnetic();

  return (
    <section ref={resumeRef} className="hero" aria-label="Hero section">
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__glow" aria-hidden="true" />

      <ParticleField density={48} className="hero__particles" tint="#548cff" />

      <div className="hero__inner">
        <nav className="hero__nav">
          <div className="hero__logo">M<span className="logo__accent">J</span></div>
          <div className="hero__nav-links">
            <a href="#about" className="nav__link">About</a>
            <a href="#projects" className="nav__link">Projects</a>
            <a href="#skills" className="nav__link">Skills</a>
            <a href="#contact" className="nav__link">Contact</a>
          </div>
          <a href="mailto:markjohnreymanaay@gmail.com" className="btn btn--glass" data-magnetic>
            Resume
          </a>
        </nav>

        <div className="hero__content">
          <div className="hero__badge">01 — Introduction</div>

          <SplitText
            tag="h1"
            className="hero__title"
            lines={[
              { text: "Building ideas into", delay: 0 },
              { text: "digital experiences.", delay: 0.15 },
            ]}
          />

          <p className="hero__subhead">
            I develop software solutions, explore modern technologies, and turn ideas into functional digital experiences.
          </p>

          <div className="hero__cta-group">
            <a href="#projects" className="btn btn--primary" data-magnetic>
              Explore My Work
            </a>
            <a href="#about" className="btn btn--outline" data-magnetic>
              About Me
            </a>
          </div>

          <div className="hero__portrait-wrap">
            <EyeProtractor />
          </div>
        </div>
      </div>
    </section>
  );
}