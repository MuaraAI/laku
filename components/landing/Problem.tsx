import { problem } from "@/constants/id";
import { Block, SectionTag, SplitText } from "./primitives";

export default function Problem() {
  return (
    <Block>
      <section className="inner" id="masalah" aria-labelledby="masalah-title">
        <div className="sec-head">
          <SectionTag no="01">{problem.tag}</SectionTag>
          <SplitText id="masalah-title" parts={problem.title} />
          <p data-reveal="">{problem.body}</p>
        </div>
        <div className="ledger" data-reveal="">
          {problem.cells.map((c) => (
            <article className="lcell" key={c.key}>
              <span className="tag">{c.key}</span>
              <span className="big num">{c.big}</span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </article>
          ))}
        </div>
      </section>
    </Block>
  );
}
