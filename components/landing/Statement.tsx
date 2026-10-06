import { statement } from "@/constants/id";
import { Crosshairs } from "./primitives";

export default function Statement() {
  return (
    <div className="rail">
      <Crosshairs />
      <section className="inner" aria-label={statement.aria}>
        <span className="tag" data-reveal="fade">
          {statement.tag}
        </span>
        <p className="spacer" data-reveal="">
          <span className="lead">{statement.lead}</span>
          <span className="hl">{statement.highlight}</span>
        </p>
      </section>
    </div>
  );
}
