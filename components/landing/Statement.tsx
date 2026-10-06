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
        {/* the question slides in from the left, the answer from the right, then its marker sweeps in */}
        <p className="spacer" data-reveal="slide">
          <span className="st-line l">
            <span className="lead">{statement.lead}</span>
          </span>
          <span className="st-line r">
            <span className="hl">{statement.highlight}</span>
          </span>
        </p>
      </section>
    </div>
  );
}
