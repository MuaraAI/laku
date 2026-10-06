import { how } from "@/constants/id";
import { Block, Headline, Icon, SectionTag } from "./primitives";

export default function How() {
  return (
    <Block>
      <section className="inner" id="cara-kerja" aria-labelledby="how-title">
        <div className="sec-head">
          <SectionTag>{how.tag}</SectionTag>
          <Headline id="how-title" parts={how.title} />
          <p data-reveal="">{how.body}</p>
        </div>
        <div className="steps" data-reveal="">
          {how.steps.map((s) => (
            <article className="step" key={s.title}>
              <span className="ic">
                <Icon name={s.icon} />
              </span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </article>
          ))}
        </div>
      </section>
    </Block>
  );
}
