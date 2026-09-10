import { PageFrame, PageFrameProps } from "./types"
import HeaderConstructor from "../Header"

const Header = HeaderConstructor()

/**
 * Full-width page frame — no sidebars. The center content area spans the
 * full width of the page. Header, beforeBody, body, afterBody, and footer
 * are all rendered in a single column.
 *
 * Useful for page types like Canvas, presentations, or dashboards that
 * need maximum horizontal space.
 */
export const FullWidthFrame: PageFrame = {
  name: "full-width",
  render({
    componentData,
    header,
    beforeBody,
    pageBody: Content,
    afterBody,
    footer,
  }: PageFrameProps) {
    return (
      <>
        <a
          class="lab-top-logo"
          href="https://javierperez.info"
          aria-label="Javier Pérez"
        >
          <img
            src="/static/JAVIERPEREZ_INFO_PEQ_azul.png"
            alt="javierperez.info"
          />
        </a>

        <div class="center full-width">
          <div class="page-header">
            <Header {...componentData}>
              {header.map((HeaderComponent) => (
                <HeaderComponent {...componentData} />
              ))}
            </Header>
            <div class="popover-hint">
              {beforeBody.map((BodyComponent) => (
                <BodyComponent {...componentData} />
              ))}
            </div>
          </div>

          <Content {...componentData} />

          <hr />

          <div class="page-footer">
            {afterBody.map((BodyComponent) => (
              <BodyComponent {...componentData} />
            ))}
          </div>
        </div>

        {footer.map((FooterComponent) => (
          <FooterComponent {...componentData} />
        ))}

        <footer class="lab-footer">
          <div class="lab-footer-inner">

            <a
              class="lab-footer-logo"
              href="https://javierperez.info"
              aria-label="Javier Pérez"
            >
              <img
                src="/static/JAVIERPEREZ_INFO_PEQ_blanco.png"
                alt="javierperez.info"
              />
            </a>

           <p class="lab-footer-notice">
  © 2026 Javier Pérez Belmonte ·{" "}
  <a
    href="https://creativecommons.org/licenses/by/4.0/"
    target="_blank"
    rel="noopener noreferrer"
  >
    CC BY 4.0
  </a>
</p>

</div>
</footer>
      </>
    )
  },
}