import { useState } from "react";
import { CommandTypeRequest, Joint, JointCommandType, RofiRequest } from "./protoc/rofi";
import { Box, Divider, LinearProgress, List, ListItem, ListItemText, Slider } from "@mui/material";

const style = {
	py: 0,
	width: '100%',
	maxWidth: 360,
	borderRadius: 2,
	border: '1px solid',
	borderColor: 'divider',
	backgroundColor: 'grey.800',
};

export function Joints({ joints, sendRofiRequest }: { joints: Joint[] | undefined, sendRofiRequest: (rofiRequest: RofiRequest) => Promise<void> }) {
	if (!joints) {
		return <div>No joints</div>;
	}

	return (
		<div className="joints">
			{joints.map((joint, index) => (
				<List key={index} sx={style}>

					<ListItem>
						<p>Joint {index + 1}</p>
					</ListItem>
					<Divider component="li" />

					<ListItem>
						<Slider
							min={joint.minPosition}
							max={joint.maxPosition}
							step={0.01}
							defaultValue={joint.position}
							onChangeCommitted={async (_, value) => {
								await sendRofiRequest({
									packetId: 0,
									command: CommandTypeRequest.JOINT,
									joint: {
										jointId: index, command: JointCommandType.SET_JOINT_POSITION,
										setPosition: { position: value as number, velocity: 1.5 }
									}
								});
							}}
							valueLabelDisplay="auto"
						/>
					</ListItem>
					<Divider component="li" />
					<ListItem>
						<Box sx={{ width: '100%' }}>
							<LinearProgress variant="determinate" value={
								(joint.position - joint.minPosition) / (joint.maxPosition - joint.minPosition) * 100
							} />

						</Box>
					</ListItem>
					<Divider component="li" />
					<ListItem>
						<p>Position: {joint.position.toFixed(2)} (min: {joint.minPosition.toFixed(2)}, max: {joint.maxPosition.toFixed(2)})</p>
					</ListItem>
					<Divider component="li" />
					<ListItem>
						<p>Speed: {joint.velocity.toFixed(2)} (min: {joint.minSpeed.toFixed(2)}, max: {joint.maxSpeed.toFixed(2)})</p>
					</ListItem>
					<Divider component="li" />
					<ListItem>
						<p>Torque: {joint.torque.toFixed(2)} (max: {joint.maxTorque.toFixed(2)})</p>
					</ListItem>

				</List>
			))
			}
		</div >
	);
}
