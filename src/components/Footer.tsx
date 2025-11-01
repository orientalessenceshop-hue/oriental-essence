import { Facebook, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-gradient-gold mb-4">Oriental Essence</h3>
            <p className="text-sm opacity-90">
              Parfumuri arabești premium, selectate cu grijă pentru cele mai rafinate gusturi.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Navigare</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-primary transition-colors">
                  Acasă
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-sm hover:text-primary transition-colors">
                  Catalog
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-primary transition-colors">
                  Despre
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Informații</h4>
            <ul className="space-y-2">
              <li className="text-sm">
                Email: orientalessence.shop@gmail.com
              </li>
              <li className="text-sm">
                Program: Luni - Vineri, 10:00 - 18:00
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Urmărește-ne</h4>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-sm opacity-80">
            © {new Date().getFullYear()} Oriental Essence. Toate drepturile rezervate.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
