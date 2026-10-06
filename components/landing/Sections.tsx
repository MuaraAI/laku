import Link from "next/link";
import { features, finalCta, footer, nav, pricing, routes } from "@/constants/id";
import { BrandButton } from "./BrandDialog";
import Features from "./Features";
import { Block, Icon, SectionTag, Headline } from "./primitives";

export function FeaturesSection() {
  return (
    <Block>
      <section className="inner" id="fitur" aria-labelledby="fitur-title">
        <div className="sec-head">
          <SectionTag no="02">{features.tag}</SectionTag>
          <Headline id="fitur-title" parts={features.title} />
        </div>
        <Features />
        <div className="stats">
          {features.stats.map((s) => (
            <div className="stat" data-reveal="" key={s.label}>
              <span className="v">{s.locale ? s.value.toLocaleString("id-ID") : s.value}</span>
              <span className="k">{s.label}</span>
            </div>
          ))}
        </div>
      </section>
    </Block>
  );
}

export function Pricing() {
  const { free, pro } = pricing;
  return (
    <Block>
      <section className="inner" id="harga" aria-labelledby="harga-title">
        <div className="sec-head center">
          <SectionTag no="05">{pricing.tag}</SectionTag>
          <Headline id="harga-title" parts={pricing.title} />
        </div>
        <div className="plans" data-reveal="">
          <article className="plan">
            <div className="top">
              <h3>{free.name}</h3>
              <span className="ptag">{free.tag}</span>
            </div>
            <div className="price">
              {free.price}
              <small>{free.priceNote}</small>
            </div>
            <ul>
              {free.items.map((it) => (
                <li key={it.text} className={it.icon === "schedule" ? "soon" : undefined}>
                  <Icon name={it.icon} />
                  {it.text}
                </li>
              ))}
            </ul>
            <Link className="btn btn-primary" href={routes.login}>
              {free.cta}
            </Link>
          </article>
          <article className="plan pro">
            <div className="top">
              <h3>{pro.name}</h3>
              <span className="ptag">{pro.tag}</span>
            </div>
            <div className="price">
              {pro.price}
              <small>{pro.priceNote}</small>
            </div>
            <ul>
              {pro.items.map((it) => (
                <li key={it.text}>
                  <Icon name={it.icon} />
                  {it.text}
                </li>
              ))}
            </ul>
          </article>
        </div>
        <p className="plans-note" data-reveal="">
          {pricing.note}
        </p>
      </section>
    </Block>
  );
}

export function FinalCta() {
  return (
    <Block>
      <div className="inner" id="coba">
        <div className="final" data-reveal="">
          <div>
            <span className="tag">{finalCta.tag}</span>
            <h2>
              {finalCta.title}
              <span className="soft">{finalCta.titleSoft}</span>
            </h2>
            <p>{finalCta.body}</p>
          </div>
          <div className="btns">
            <Link className="btn btn-primary" href={routes.login}>
              {finalCta.primary}
            </Link>
            <Link className="btn btn-outline" href={routes.login}>
              {finalCta.secondary}
            </Link>
          </div>
        </div>
      </div>
    </Block>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="rail">
        <div className="f-top">
          <div>
            <BrandButton className="f-logo">
              <svg className="mark" aria-hidden="true">
                <use href="#laku-mark" />
              </svg>
              <span className="logo-name">{nav.brandName}</span>
            </BrandButton>
            <p>{footer.about}</p>
          </div>
          {footer.cols.map((col) => (
            <div className="f-col" key={col.title}>
              <h4>{col.title}</h4>
              {col.links.map((l) =>
                l.href.startsWith("http") ? (
                  <a key={l.label} href={l.href} rel="noopener">
                    {l.label}
                  </a>
                ) : (
                  <Link key={l.label} href={l.href}>
                    {l.label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>
        <div className="wordmark" aria-hidden="true">
          {footer.wordmark}
        </div>
        <div className="f-bottom">
          <span className="mono">{footer.copyright}</span>
          <p>{footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
