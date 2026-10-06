import Link from "next/link";
import { hero, routes } from "@/constants/id";
import { AssumptionBadge, Headline, Icon, StatusBadge } from "./primitives";

export default function Hero() {
  return (
    <div className="rail">
      <section className="hero" aria-labelledby="hero-title">
        <article className="panel" aria-label={hero.panelAria} data-reveal="">
          <div className="panel-body">
            <div className="sc-head">
              <div className="sc-title">{hero.title}</div>
              <span className="demo-chip">{hero.demoChip}</span>
            </div>
            <p className="tb-hint">{hero.hint}</p>
            <div className="tb">
              <div className="tb-head" aria-hidden="true">
                {hero.cols.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
              <ul className="tb-list">
                {hero.rows.map((r) => (
                  <li key={r.name} className={`tb-row${r.hot ? " hot" : ""}`}>
                    <span className="tb-name">{r.name}</span>
                    <span className="tb-num">{r.stock}</span>
                    <span className="tb-num tb-days">{r.days}</span>
                    <StatusBadge kind={r.status} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="sc-foot">
              <Icon name="local_shipping" />
              <div className="sum">
                <span className="k">{hero.footKey}</span>
                <span className="v">
                  {hero.footProduct}
                  <span className="num">{hero.footQty}</span>
                  {hero.footUnit}
                </span>
              </div>
              <a className="btn btn-outline btn-sm" href="#mengapa">
                {hero.footWhy}
              </a>
            </div>
          </div>
        </article>

        <div className="hero-copy">
          <span className="tag" data-reveal="fade">
            <b>00</b> {hero.tag}
          </span>
          <Headline as="h1" id="hero-title" parts={hero.headline} />
          <p className="sub" data-reveal="">
            {hero.sub}
          </p>
          <div className="route" aria-hidden="true">
            <span className="pin from">
              <span className="ms">factory</span>
              <span>
                {hero.routeFrom}
                <span className="long">{hero.routeFromLong}</span>
              </span>
            </span>
            <span className="lt">
              <span>
                <span className="long">{hero.routeLeadLong}</span>
                {hero.routeLead}
              </span>{" "}
              <AssumptionBadge />
            </span>
            <span className="pin to">
              <span className="ms fill">warehouse</span>
              <span>
                {hero.routeTo}
                <span className="long">{hero.routeToLong}</span>
              </span>
            </span>
          </div>
          <p className="route-cap" data-reveal="">
            {hero.routeCap}
          </p>
        </div>

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
