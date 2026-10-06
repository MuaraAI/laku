import { Fragment } from "react";
import { why } from "@/constants/id";
import { AssumptionBadge, Block, Headline, Icon, SectionTag } from "./primitives";

const { nota } = why;

export default function Why() {
  return (
    <Block>
      <section className="inner why-grid" id="mengapa" aria-labelledby="why-title">
        <div className="sec-head">
          <SectionTag no="03">{why.tag}</SectionTag>
          <Headline id="why-title" parts={why.title} />
          <p data-reveal="">{why.body}</p>
          <div className="principles" data-reveal="">
            {why.principles.map((p) => (
              <div key={p}>
                <Icon name="check" />
                {p}
              </div>
            ))}
          </div>
        </div>
        <div className="desk" data-reveal="">
          <div className="nota" role="img" aria-label={nota.aria}>
            <div className="n-head">
              <b>{nota.head}</b>
              <span>{nota.shop}</span>
              <span>{nota.date}</span>
            </div>
            <hr className="n-rule" />
            <div className="n-item">{nota.item}</div>
            {nota.lines.map((l) => (
              <Fragment key={l.k}>
                <div className="ln">
                  <span className="k">
                    {l.k}
                    {l.assumed && (
                      <>
                        {" "}
                        <AssumptionBadge />
                      </>
                    )}
                  </span>
                  <span className="d" />
                  <span className="v">{l.v}</span>
                </div>
                {l.formula && <div className="f">{l.formula}</div>}
              </Fragment>
            ))}
            <hr className="n-rule dbl" />
            <div className="n-total">
              <span className="k">{nota.totalKey}</span>
              <span className="v">
                {nota.total}
                <small>{nota.unit}</small>
              </span>
            </div>
            <div className="f">{nota.totalFormula}</div>
            <hr className="n-rule" />
            <div className="barcode" aria-hidden="true" />
            <div className="n-foot">{nota.foot}</div>
          </div>
        </div>
      </section>
    </Block>
  );
}
