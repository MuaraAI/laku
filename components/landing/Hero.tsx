import Image from "next/image";
import Link from "next/link";
import { hero, routes } from "@/constants/id";
import { AssumptionBadge, Headline, Icon } from "./primitives";

export default function Hero() {
  return (
    <div className="rail">
      <section className="hero" aria-labelledby="hero-title">
        <span className="tag" data-reveal="fade">
          {hero.tag}
        </span>
        <Headline as="h1" id="hero-title" parts={hero.headline} split />
        <p className="sub" data-reveal="">
          {hero.sub}
        </p>
        <div className="hero-cta" data-reveal="">
          <Link className="btn btn-primary" href={routes.login}>
            {hero.ctaPrimary}
          </Link>
          <a className="btn btn-outline" href="#cara-kerja">
            {hero.ctaSecondary}
            <span className="go">
              <Icon name="arrow_forward" />
            </span>
          </a>
        </div>

        {/* the stock pile: same illustration as the login panel */}
        <div className="hero-visual" data-reveal="" aria-hidden="true">
          <Image className="hero-crates" src="/illustrations/stock-crates.svg" alt="" width={357} height={394} priority unoptimized />
        </div>

        {/* supplier → warehouse: the line draws, then one parcel makes the trip */}
        <div className="route" data-reveal="route" aria-hidden="true">
          <span className="pin from">
            <span className="ms">factory</span>
            <span>
              {hero.routeFrom}
            </span>
          </span>
          <span className="track">
            <span className="lt">
              <span>
                <span className="long">{hero.routeLeadLong}</span>
                {hero.routeLead}
              </span>{" "}
              <AssumptionBadge />
            </span>
            <span className="packet" />
          </span>
          <span className="pin to">
            <span className="ms fill">warehouse</span>
            <span>
              {hero.routeTo}
            </span>
          </span>
        </div>
        <p className="route-cap" data-reveal="fade">
          {hero.routeCap}
        </p>

        <div className="hero-note" data-reveal="fade">
          {hero.notes.map((n) => (
            <span key={n}>
              <Icon name="check" />
              {n}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
