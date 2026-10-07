import Link from "next/link";
import { hero, routes } from "@/constants/id";
import { AssumptionBadge, Headline, Icon } from "./primitives";
import SupplyMap from "./SupplyMap";

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
          <Link className="btn btn-primary" href={routes.afterLogin}>
            {hero.ctaPrimary}
          </Link>
          {/* the round badge floods the button on hover; its arrow drops out and a new one drops in */}
          <a className="btn btn-outline btn-flood" href="#cara-kerja">
            <span className="lbl">{hero.ctaSecondary}</span>
            <span className="go" aria-hidden="true">
              <span className="go-win">
                <Icon name="arrow_downward" />
                <Icon name="arrow_downward" />
              </span>
            </span>
          </a>
        </div>

        {/* supplier routes across Indonesia into one warehouse: same map as the login panel */}
        <div className="hero-visual" data-reveal="">
          <SupplyMap tone="light" />
        </div>

        {/* supplier → warehouse: the line draws, then one parcel makes the trip */}
        <div className="route" data-reveal="route" aria-hidden="true">
          <span className="pin from">
            <Icon name="factory" />
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
            <Icon name="warehouse" fill />
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
