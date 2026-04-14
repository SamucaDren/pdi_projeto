import "./edit_tools.css";
import SliderZoom from "./slider_zoom";
import type { Filter } from "../types";

type EditToolsProps = {
  zoom: number;
  setZoom: (zoom: number) => void;
  activeFilter: Filter | null;
  setActiveFilter: (filter: Filter | null) => void;
};

function EditTools({
  zoom,
  setZoom,
  activeFilter,
  setActiveFilter,
}: EditToolsProps) {
  return (
    <div className="edit_tools_bar">
      <div className="options_box">
        <div
          className={
            "options_container" +
            (activeFilter === "brilho" ? " option_active" : "")
          }
          onClick={() => setActiveFilter("brilho")}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="option_icon"
          >
            <g clip-path="url(#clip0_27_2)">
              <path
                d="M12 3.75V1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 17.25C14.8995 17.25 17.25 14.8995 17.25 12C17.25 9.10051 14.8995 6.75 12 6.75C9.10051 6.75 6.75 9.10051 6.75 12C6.75 14.8995 9.10051 17.25 12 17.25Z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M6 6L4.5 4.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M6 18L4.5 19.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M18 6L19.5 4.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M18 18L19.5 19.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M3.75 12H1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 20.25V22.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M20.25 12H22.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
          </svg>
          <span>Brilho</span>
        </div>

        <div
          className={
            "options_container" +
            (activeFilter === "desfoque" ? " option_active" : "")
          }
          onClick={() => setActiveFilter("desfoque")}
        >
          <svg
            className="option_icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_30_38)">
              <path
                d="M19 14.0769C19 7.84615 12.5 3 12.5 3C12.5 3 6 7.84615 6 14.0769C6 15.913 6.68482 17.6739 7.90381 18.9723C9.12279 20.2706 10.7761 21 12.5 21C14.2239 21 15.8772 20.2706 17.0962 18.9723C18.3152 17.6739 19 15.913 19 14.0769Z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
          </svg>

          <span>Desfoque</span>
        </div>

        <div
          className={
            "options_container" +
            (activeFilter === "realce" ? " option_active" : "")
          }
          onClick={() => setActiveFilter("realce")}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="option_icon"
          >
            <g clip-path="url(#clip0_31_42)">
              <path
                d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8.625 11.25C9.24632 11.25 9.75 10.7463 9.75 10.125C9.75 9.50368 9.24632 9 8.625 9C8.00368 9 7.5 9.50368 7.5 10.125C7.5 10.7463 8.00368 11.25 8.625 11.25Z"
                fill="#D32F2F"
              />
              <path
                d="M15.375 11.25C15.9963 11.25 16.5 10.7463 16.5 10.125C16.5 9.50368 15.9963 9 15.375 9C14.7537 9 14.25 9.50368 14.25 10.125C14.25 10.7463 14.7537 11.25 15.375 11.25Z"
                fill="#D32F2F"
              />
              <path
                d="M15.75 14.25C14.9719 15.5953 13.6659 16.5 12 16.5C10.3341 16.5 9.02813 15.5953 8.25 14.25"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
          </svg>
          <span>Realces</span>
        </div>

        <div
          className={
            "options_container" +
            (activeFilter === "acne" ? " option_active" : "")
          }
          onClick={() => setActiveFilter("acne")}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="option_icon"
          >
            <g clip-path="url(#clip0_31_42)">
              <path
                d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8.625 11.25C9.24632 11.25 9.75 10.7463 9.75 10.125C9.75 9.50368 9.24632 9 8.625 9C8.00368 9 7.5 9.50368 7.5 10.125C7.5 10.7463 8.00368 11.25 8.625 11.25Z"
                fill="#D32F2F"
              />
              <path
                d="M15.375 11.25C15.9963 11.25 16.5 10.7463 16.5 10.125C16.5 9.50368 15.9963 9 15.375 9C14.7537 9 14.25 9.50368 14.25 10.125C14.25 10.7463 14.7537 11.25 15.375 11.25Z"
                fill="#D32F2F"
              />
              <path
                d="M15.75 14.25C14.9719 15.5953 13.6659 16.5 12 16.5C10.3341 16.5 9.02813 15.5953 8.25 14.25"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
          </svg>
          <span>Acne</span>
        </div>
      </div>

      <SliderZoom zoom={zoom} setZoom={setZoom} />
    </div>
  );
}
export default EditTools;
