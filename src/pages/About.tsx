import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Award, Heart, Shield } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="py-12 bg-gradient-to-br from-secondary/20 to-accent/20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-center mb-4">Despre Noi</h1>
          <p className="text-xl text-center text-muted-foreground max-w-2xl mx-auto">
            Pasiunea pentru parfumurile orientale, transformată în experiență
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Oriental Essence este mai mult decât un magazin de parfumuri – este o poveste de pasiune 
                și dedicare pentru arta parfumeriei orientale. Fondată din dorința de a aduce în România 
                cele mai rafinate arome din Orientul Mijlociu, misiunea noastră este să oferim clienților 
                noștri acces la parfumuri autentice, de cea mai înaltă calitate.
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Fiecare parfum din colecția noastră este selectat cu grijă, reprezentând tradiția milenară 
                a parfumeriei arabe, îmbinată cu eleganța modernă. De la clasicul oud până la sofisticatele 
                compoziții florale-orientale, fiecare sticlă poartă o poveste unică.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center p-6 bg-card border border-border rounded-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Calitate Garantată</h3>
                <p className="text-muted-foreground">
                  Toate produsele sunt 100% originale, cu certificat de autenticitate
                </p>
              </div>

              <div className="text-center p-6 bg-card border border-border rounded-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Pasiune & Dedicare</h3>
                <p className="text-muted-foreground">
                  Suntem pasionați de parfumuri și ne dedicăm satisfacției tale
                </p>
              </div>

              <div className="text-center p-6 bg-card border border-border rounded-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Încredere</h3>
                <p className="text-muted-foreground">
                  Peste 1000 de clienți mulțumiți ne recomandă cu încredere
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
