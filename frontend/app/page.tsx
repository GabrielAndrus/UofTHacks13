export default function Home() {
  return (
    <>
      <header>
        <div className="header-left">
          <div className="logo-bb">B<span>B</span></div>
          <div className="header-title">Building Blocks</div>
        </div>
        <div className="header-center"></div>
        <div className="header-right">
          <div className="icon-box">
            <i className="fa-brands fa-github"></i>
          </div>
          <div className="icon-box">
            <div className="mlh-logo">MLH</div>
          </div>
          <div className="icon-box" style={{ border: 'none' }}>
            <div className="deer-logo">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C8 2 6 5 6 7c0 1.5 1 2.5 1 2.5S5 12 5 14c0 1.5 1 3 3 3 0 0 .5 2 4 2s4-2 4-2c2 0 3-1.5 3-3 0-2-2-4.5-2-4.5s1-1 1-2.5c0-2-2-5-6-5z" fill="none" stroke="#b388ff" strokeWidth="2"/>
                <path d="M8 7l-2-2m10 2l2-2" stroke="#b388ff" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
      </header>

      <div className="hero-section">
        <div className="content-wrapper">
          <div className="text-section">
            <h1>Rebuild<br/>your <em>identity,</em></h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
          <div className="visual-section">
            <div className="lego-stack">
              <div className="brick red-brick">
                <div className="face face-front">PIECE</div>
                <div className="face face-top"></div>
                <div className="face face-side"></div>
              </div>
              <div className="brick blue-brick">
                <div className="face face-front">BY</div>
                <div className="face face-top"></div>
                <div className="face face-side"></div>
              </div>
              <div className="brick gold-brick">
                <div className="face face-front">PIECE</div>
                <div className="face face-top"></div>
                <div className="face face-side"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="builder-container">
        <div className="builder-top-row">
          <div className="env-wrapper">
            <div className="panel-header header-bg-red">Environment</div>
            <div className="panel panel-content">
              <div className="canvas-placeholder">
                this part is just<br/>whatever the 3d<br/>model is
              </div>
              <div className="zoom-controls">
                <div className="zoom-btn">
                  <i className="fa-solid fa-expand"></i>
                </div>
                <div className="zoom-btn">
                  <i className="fa-solid fa-plus"></i>
                </div>
                <div className="zoom-btn">
                  <i className="fa-solid fa-minus"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="obj-wrapper">
            <div className="panel-header header-bg-cyan">Objects</div>
            <div className="panel panel-content">
              <div className="objects-grid">
                <div className="obj-item"></div>
                <div className="obj-item"></div>
                <div className="obj-item"></div>
                <div className="obj-item"></div>
                <div className="obj-add">
                  <i className="fa-solid fa-plus"></i>
                </div>
              </div>
            </div>
            <div className="frog-btn">
              <span className="frog-icon">🐸</span>
            </div>
          </div>
        </div>

        <div className="full-set-row">
          <div className="panel-header header-bg-orange">Full Set</div>
          <div className="box-art-container">
            <div className="lego-box-perspective">
              <div className="box-spine">
                <div className="spine-logo">B<span>B</span></div>
                <div className="spine-age">9+</div>
                <div className="spine-sku">202601</div>
                <div className="spine-line"></div>
                
                <div className="spine-name">Name of<br/>Lego Set</div>
                <div className="spine-pcs">XXX<br/>pcs/pzs</div>
                <div className="spine-sub">Building Toy<br/>Jouet de construction</div>
              </div>
              <div className="box-front">
                <div className="box-front-text">3d model of the<br/>environment +<br/>objects</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
